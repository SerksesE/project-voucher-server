import { BaseEntity, PrimaryGeneratedColumn, Entity, ManyToOne, Column, Generated } from 'typeorm'
import Form from '../forms/entity'
import { IsEmail } from 'class-validator';

@Entity()
export default class Coupon extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'date', default: () => 'NOW()' })
  created_at: Date

  @Column('date', { nullable: true })
  used_at: Date

  @IsEmail()
  @Column('text')
  email: string

  @Column()
  @Generated("uuid")
  uuid: string

  @ManyToOne(() => Form, form => form.coupons)
  forms: Form
}