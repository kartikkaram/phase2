import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  BaseEntity,
} from "typeorm";
import { User } from "./user.entities";
import { Post } from "./post.entities";


export enum CommentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

@Entity("comments")
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // comment belongs to a post
  @ManyToOne(() => Post, { nullable: false, onDelete: "CASCADE" })
  @Index()
  post!: Post;

  // comment author
  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @Index()
  author!: User;

  // self-referencing (reply to another comment)
  @ManyToOne(() => Comment, (comment) => comment.children, {
    nullable: true,
    onDelete: "CASCADE",
  })
  @Index()
  parentComment?: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  children!: Comment[];

  @Column("text")
  content!: string;

  @Column({
    type: "enum",
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  @Index()
  status!: CommentStatus;

  // voting
  @Column({ default: 0 })
  upvotesCount!: number;

  @Column({ default: 0 })
  downvotesCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // replace Mongoose `trim: true`
  @BeforeInsert()
  @BeforeUpdate()
  normalizeContent() {
    this.content = this.content.trim();
  }
}
