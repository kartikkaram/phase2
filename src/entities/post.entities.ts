import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BaseEntity,
  BeforeUpdate,
} from "typeorm";
import { User } from "./user.entities";
import { Category } from "./category.entities";


export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

@Entity("posts")
@Index(["title", "content"], { fulltext: true }) // text search equivalent
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ unique: true })
  @Index()
  slug!: string;

  @Column("text")
  content!: string;

  @Column({
    type: "enum",
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  @Index()
  status!: PostStatus;

  // author → User
  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @Index()
  author!: User;

  // categories → Category[]
  @ManyToMany(() => Category)
  @JoinTable({
    name: "post_categories",
  })
  categories!: Category[];

  // attachments (array of strings)
  @Column("text", { array: true, default: [] })
  attachments!: string[];

  // analytics
  @Column({ default: 0 })
  viewCount!: number;

  @Column({ default: 0 })
  upvotesCount!: number;

  @Column({ default: 0 })
  downvotesCount!: number;

  @Column({ type: "timestamp", nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
@BeforeUpdate()
normalizeTitle() {
  this.title = this.title.trim();
}

  // auto-generate slug (Mongoose pre('validate') equivalent)
  @BeforeInsert()
  generateSlug() {
    if (!this.slug && this.title) {
      this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  }
}
