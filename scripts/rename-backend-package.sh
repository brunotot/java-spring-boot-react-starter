#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage:" >&2
  echo "  $0 --old-group=com.example --old-artifact=old_app --new-group=com.example --new-artifact=new_app" >&2
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

is_java_keyword() {
  case "$1" in
    abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

validate_identifier() {
  local value="$1"
  local label="$2"

  if [[ ! "$value" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    fail "$label is malformed: $value"
  fi

  if is_java_keyword "$value"; then
    fail "$label is a reserved Java keyword: $value"
  fi
}

validate_group() {
  local value="$1"
  local label="$2"

  if [[ ! "$value" =~ ^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$ ]]; then
    fail "$label is malformed: $value"
  fi

  IFS='.' read -ra segments <<< "$value"

  for segment in "${segments[@]}"; do
    validate_identifier "$segment" "$label segment"
  done
}

package_to_path() {
  echo "$1" | tr '.' '/'
}

escape_regex() {
  printf '%s' "$1" | sed 's/[.[\*^$()+?{}|]/\\&/g'
}

move_package_dir() {
  local root_dir="$1"
  local old_path="$2"
  local new_path="$3"

  local old_dir="${root_dir}/${old_path}"
  local new_dir="${root_dir}/${new_path}"

  if [ ! -d "$old_dir" ]; then
    return 0
  fi

  if [ -e "$new_dir" ]; then
    fail "Target package directory already exists: $new_dir"
  fi

  local tmp_dir
  tmp_dir="$(mktemp -d)"

  mkdir -p "$(dirname "$new_dir")"
  mv "$old_dir" "$tmp_dir/package"
  mv "$tmp_dir/package" "$new_dir"
  rmdir "$tmp_dir"

  find "$root_dir" -type d -empty -delete
}

set_property_value() {
  local file="$1"
  local key="$2"
  local value="$3"

  [ -f "$file" ] || fail "Required file does not exist: $file"

  local tmp_file
  tmp_file="$(mktemp)"

  awk -v key="$key" -v value="$value" '
    BEGIN { updated = 0 }
    $0 ~ "^" key "=" {
      print key "=" value
      updated = 1
      next
    }
    { print }
    END {
      if (updated == 0) {
        print key "=" value
      }
    }
  ' "$file" > "$tmp_file"

  mv "$tmp_file" "$file"
}

replace_gradle_root_project_name() {
  local file="settings.gradle"
  local old_artifact="$1"
  local new_artifact="$2"

  [ -f "$file" ] || fail "Required file does not exist: $file"

  local old_artifact_regex
  old_artifact_regex="$(escape_regex "$old_artifact")"

  if ! grep -Eq "^[[:space:]]*rootProject\.name[[:space:]]*=[[:space:]]*['\"]${old_artifact_regex}['\"]" "$file"; then
    fail "Could not find matching rootProject.name declaration in $file: $old_artifact"
  fi

  local tmp_file
  tmp_file="$(mktemp)"

  awk -v old_artifact="$old_artifact" -v new_artifact="$new_artifact" '
    /^[[:space:]]*rootProject\.name[[:space:]]*=/ && updated == 0 {
      line = $0
      gsub("'"'"'" old_artifact "'"'"'", "'"'"'" new_artifact "'"'"'", line)
      gsub("\"" old_artifact "\"", "\"" new_artifact "\"", line)
      print line
      updated = 1
      next
    }
    { print }
  ' "$file" > "$tmp_file"

  mv "$tmp_file" "$file"
}

replace_gradle_group() {
  local file="build.gradle"
  local old_group="$1"
  local new_group="$2"

  [ -f "$file" ] || fail "Required file does not exist: $file"

  local old_group_regex
  old_group_regex="$(escape_regex "$old_group")"

  if ! grep -Eq "^[[:space:]]*group[[:space:]]*=[[:space:]]*['\"]${old_group_regex}['\"]" "$file"; then
    fail "Could not find matching group declaration in $file: $old_group"
  fi

  local tmp_file
  tmp_file="$(mktemp)"

  awk -v old_group="$old_group" -v new_group="$new_group" '
    /^[[:space:]]*group[[:space:]]*=/ && updated == 0 {
      line = $0
      gsub("'"'"'" old_group "'"'"'", "'"'"'" new_group "'"'"'", line)
      gsub("\"" old_group "\"", "\"" new_group "\"", line)
      print line
      updated = 1
      next
    }
    { print }
  ' "$file" > "$tmp_file"

  mv "$tmp_file" "$file"
}

OLD_GROUP=""
OLD_ARTIFACT=""
NEW_GROUP=""
NEW_ARTIFACT=""

for arg in "$@"; do
  case "$arg" in
    --old-group=*)
      OLD_GROUP="${arg#*=}"
      ;;
    --old-artifact=*)
      OLD_ARTIFACT="${arg#*=}"
      ;;
    --new-group=*)
      NEW_GROUP="${arg#*=}"
      ;;
    --new-artifact=*)
      NEW_ARTIFACT="${arg#*=}"
      ;;
    *)
      fail "Unknown argument: $arg"
      ;;
  esac
done

if [ -z "$OLD_GROUP" ] || [ -z "$OLD_ARTIFACT" ] || [ -z "$NEW_GROUP" ] || [ -z "$NEW_ARTIFACT" ]; then
  usage
  exit 1
fi

validate_group "$OLD_GROUP" "Old group"
validate_identifier "$OLD_ARTIFACT" "Old artifact"
validate_group "$NEW_GROUP" "New group"
validate_identifier "$NEW_ARTIFACT" "New artifact"

OLD_PACKAGE="${OLD_GROUP}.${OLD_ARTIFACT}"
NEW_PACKAGE="${NEW_GROUP}.${NEW_ARTIFACT}"

if [ "$OLD_PACKAGE" = "$NEW_PACKAGE" ]; then
  fail "Old package and new package are the same"
fi

[ -d "src/main/java" ] || fail "Run this script from the repository root. Missing: src/main/java"
[ -f "build.gradle" ] || fail "Run this script from the repository root. Missing: build.gradle"

OLD_PACKAGE_PATH="$(package_to_path "$OLD_PACKAGE")"
NEW_PACKAGE_PATH="$(package_to_path "$NEW_PACKAGE")"
OLD_MAIN_DIR="src/main/java/${OLD_PACKAGE_PATH}"

[ -d "$OLD_MAIN_DIR" ] || fail "Old package directory does not exist: $OLD_MAIN_DIR"

OLD_PACKAGE_REGEX="$(escape_regex "$OLD_PACKAGE")"

if find "$OLD_MAIN_DIR" -type f -name "*.java" | grep -q .; then
  BAD_FILES="$(
    find "$OLD_MAIN_DIR" -type f -name "*.java" -print0 \
      | xargs -0 grep -L -E "^[[:space:]]*package[[:space:]]+${OLD_PACKAGE_REGEX}(\.|;)" || true
  )"

  if [ -n "$BAD_FILES" ]; then
    echo "$BAD_FILES" >&2
    fail "Some Java files under old package directory do not use package $OLD_PACKAGE"
  fi
else
  fail "No Java files found under old package directory: $OLD_MAIN_DIR"
fi

replace_gradle_group "$OLD_GROUP" "$NEW_GROUP"
replace_gradle_root_project_name "$OLD_ARTIFACT" "$NEW_ARTIFACT"

move_package_dir "src/main/java" "$OLD_PACKAGE_PATH" "$NEW_PACKAGE_PATH"

if [ -d "src/test/java/${OLD_PACKAGE_PATH}" ]; then
  move_package_dir "src/test/java" "$OLD_PACKAGE_PATH" "$NEW_PACKAGE_PATH"
fi

export OLD_PACKAGE
export NEW_PACKAGE

find src/main/java src/test/java -type f -name "*.java" 2>/dev/null \
  -exec perl -pi -e 's/\Q$ENV{OLD_PACKAGE}\E/$ENV{NEW_PACKAGE}/g' {} +

set_property_value "src/main/resources/application.properties" "spring.application.name" "$NEW_ARTIFACT"
set_property_value "src/main/resources/application-dev.properties" "spring.application.name" "${NEW_ARTIFACT}-dev"

echo "Backend package renamed successfully:"
echo "  Package: $OLD_PACKAGE -> $NEW_PACKAGE"
echo "  Gradle group: $OLD_GROUP -> $NEW_GROUP"
echo "  rootProject.name: $OLD_ARTIFACT -> $NEW_ARTIFACT"
echo "  spring.application.name: $NEW_ARTIFACT"
echo "  spring.application.name dev: ${NEW_ARTIFACT}-dev"
