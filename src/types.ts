export enum MessageType {
  message = "message",
  username = "username",
};

export interface Message {
  type: MessageType;
  name?: string;
  target?: string;
  text?: string;
};