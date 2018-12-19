import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { IsString } from 'class-validator';
import Form from '../forms/entity';

@Entity()
export default class Location extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @IsString()
  @Column('text', { nullable: false })
  name: string

  @Column('text')
  logo: string

  @Column('text')
  background_color: string

  @Column('text')
  button_color: string

  @Column('text')
  button_text_color: string

  @Column('text')
  coffee_image: string

  @Column('text')
  coupon_image: string

  @Column('text')
  free_color: string

  @Column('text')
  coffee_color: string

  @Column('text')
  courtesy_color: string

  @OneToMany(() => Form, form => form.location)
  form: Form
}