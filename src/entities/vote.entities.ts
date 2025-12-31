import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BaseEntity,
} from "typeorm";
import { User } from "./user.entities";


export enum VoteTargetType {
  POST = "post",
  COMMENT = "comment",
}

@Entity("votes")
@Index(["user", "targetType", "targetId"], { unique: true })
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // who voted
  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @Index()
  user!: User;

  // post or comment
  @Column({
    type: "enum",
    enum: VoteTargetType,
  })
  @Index()
  targetType!: VoteTargetType;

  // id of post OR comment (polymorphic)
  @Column("uuid")
  @Index()
  targetId!: string;

  // +1 or -1
  @Column({
    type: "int",
  })
  value!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
