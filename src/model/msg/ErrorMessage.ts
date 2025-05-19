export default interface ErrorMessage {
  status: number;
  error: string
  detail: string;
  stack: string;
}