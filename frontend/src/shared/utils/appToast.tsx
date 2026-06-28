import { RgoSnack, toast } from "@rgo/front-ui";

export function showSuccessToast(message: string): void {
  toast(<RgoSnack variant="success" message={message} />);
}

export function showErrorToast(message: string): void {
  toast(<RgoSnack variant="error" message={message} />);
}
