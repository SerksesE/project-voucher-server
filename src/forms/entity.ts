import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import Location from '../locations/entity';
import Coupon from '../coupons/entity';

@Entity()
export default class Form extends BaseEntity {

  @PrimaryGeneratedColumn()
  id?: number

  @Column('text', { nullable: false })
  typeform_id: string

  @Column('text')
  barcode: string

  @ManyToOne(() => Location, location => location.form)
  location: Location

  @OneToMany(() => Coupon, coupon => coupon.forms)
  coupons: Coupon[]  
}