import { DomainEvent } from 'common/domain';

export class MessageCreatedEvent extends DomainEvent {
  readonly eventName = 'message.created';
  readonly messageId: string;

  constructor({ messageId }: { messageId: string }) {
    super();
    this.messageId = messageId;
  }
}
