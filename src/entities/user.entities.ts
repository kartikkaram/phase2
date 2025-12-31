import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  BaseEntity,
  AfterLoad,
} from "typeorm";
import bcrypt from "bcrypt";
import  jwt from "jsonwebtoken";


export enum UserRole {
  ADMIN = "admin",
  AUTHOR = "author",
  READER = "reader",
}

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.READER,
  })
  role!: UserRole;

  @Column({ nullable: true })
  accessToken?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

private tempPassword?: string;

@BeforeInsert()
async hashPasswordOnInsert() {
  this.password = await bcrypt.hash(this.password, 10);
}

@AfterLoad()
loadTempPassword() {
  this.tempPassword = this.password;
}

@BeforeUpdate()
async hashPasswordOnUpdate() {
  if (this.password !== this.tempPassword) {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

 generateAccessToken() {
  return jwt.sign(
    {
      id: this.id
    },
    process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as string,
    } as jwt.SignOptions
  );
}


   generateRefreshToken() {
    return jwt.sign(
      {
         id: this.id 
      },
      process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as string } as jwt.SignOptions
    );
  }

  async isPasswordCorrect(password:string):Promise<boolean>{
    return await bcrypt.compare(password, this.password)
  }
}
