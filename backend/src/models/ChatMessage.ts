import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from './User'
import { ChatConversation } from './ChatConversation'

@Entity({ name: 'ChatMessages' })
export class ChatMessage {
  @PrimaryGeneratedColumn()
  MessageID!: number

  @ManyToOne(() => ChatConversation, conversation => conversation.messages, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'ConversationID' })
  conversation!: ChatConversation

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'SenderUserID' })
  sender!: User

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'RecipientUserID' })
  recipient!: User

  @Column('text')
  Message!: string

  @Column({ default: false })
  IsRead!: boolean

  @CreateDateColumn()
  CreatedAt!: Date
}
