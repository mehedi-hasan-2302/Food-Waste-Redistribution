import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm'
import { User } from './User'
import { ChatMessage } from './ChatMessage'

@Entity({ name: 'ChatConversations' })
@Unique(['participantOne', 'participantTwo'])
export class ChatConversation {
  @PrimaryGeneratedColumn()
  ConversationID!: number

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ParticipantOneUserID' })
  participantOne!: User

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ParticipantTwoUserID' })
  participantTwo!: User

  @OneToMany(() => ChatMessage, message => message.conversation)
  messages?: ChatMessage[]

  @CreateDateColumn()
  CreatedAt!: Date

  @UpdateDateColumn()
  UpdatedAt!: Date
}
