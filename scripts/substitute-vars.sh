#!/usr/bin/env bash
set -euo pipefail

VARS_FILE=""
INPUT_FILE=""
OUTPUT_FILE=""

for arg in "$@"; do
  case "$arg" in
    --vars-file=*)
      VARS_FILE="${arg#*=}"
      ;;
    --input-file=*)
      INPUT_FILE="${arg#*=}"
      ;;
    --output-file=*)
      OUTPUT_FILE="${arg#*=}"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

if [ -z "$VARS_FILE" ] || [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
  echo "Usage: $0 --vars-file=path --input-file=path --output-file=path" >&2
  exit 1
fi

if [ ! -f "$VARS_FILE" ]; then
  echo "Variables file does not exist: $VARS_FILE" >&2
  exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
  echo "Input file does not exist: $INPUT_FILE" >&2
  exit 1
fi

perl -Mstrict -Mwarnings -e '
  my ($vars_file, $input_file, $output_file) = @ARGV;

  open my $vf, "<", $vars_file or die "Cannot open variables file: $!\n";

  my %vars;

  while (my $line = <$vf>) {
    chomp $line;
    $line =~ s/\r$//;

    next if $line =~ /^\s*$/;
    next if $line =~ /^\s*#/;

    if ($line !~ /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/) {
      die "Invalid variable line $.: $line\n";
    }

    $vars{$1} = $2;
  }

  close $vf;

  open my $in, "<", $input_file or die "Cannot open input file: $!\n";
  local $/;
  my $text = <$in>;
  close $in;

  my %missing;

  $text =~ s/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/
    exists $vars{$1}
      ? $vars{$1}
      : do {
          $missing{$1} = 1;
          "\${$1}";
        }
  /ge;

  if (%missing) {
    die "Missing values for placeholders: " . join(", ", sort keys %missing) . "\n";
  }

  open my $out, ">", $output_file or die "Cannot write output file: $!\n";
  print $out $text;
  close $out;
' "$VARS_FILE" "$INPUT_FILE" "$OUTPUT_FILE"