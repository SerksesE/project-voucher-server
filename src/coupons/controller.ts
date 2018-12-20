import { JsonController, Param, HttpCode, Post, Get, Body, NotFoundError, Patch, BadRequestError } from 'routing-controllers'
import { Context } from 'koa'
import Coupon from './entity';
import * as request from 'superagent'
import Form from '../forms/entity';
import { renderTemplate } from './email-template';

@JsonController()
export default class CouponController {

  @Get('/coupons/:uuid')
  getCoupon(
    @Param('uuid') uuid: string
  ) {
    return Coupon.findOneOrFail({ uuid: uuid }, { relations: ['forms', 'forms.location'] })
  }

  @Get('/coupons')
  async allCoupons() {
    const coupons = await Coupon.find()
    return { coupons }
  }

  @Patch('/coupons/:uuid')
  async updateCoupon(
    @Param('uuid') uuid: string
  ) {
    const coupon = await Coupon.findOneOrFail({ uuid: uuid })
    if (!coupon) throw new NotFoundError('invalid coupon id')
    
    if (coupon.used_at) throw new BadRequestError('coupon already used on ' + new Date(coupon.used_at))
  
    const fifteen_days = 15 * 24 * 60 * 60 * 1000
 
    if (new Date(Date.now() - fifteen_days) > new Date(coupon.created_at)) throw new BadRequestError('activation date expired')

    return Coupon.merge(coupon, { used_at: new Date(Date.now()) }).save()
  }

  @Post('/coupons')
  @HttpCode(201)
  async postCoupon(
    @Body() ctx: Context,
  ) {
    const newCoupon = Coupon.create({
      email: ctx.form_response.answers.filter(answer => answer.type === 'email')[0].email,
      forms: await Form.findOne({ typeform_id: ctx.form_response.form_id }),
    })
    await newCoupon.save()
   
    if (!newCoupon || !newCoupon.id) throw new NotFoundError('Invalid coupon')

    await request.post(process.env.API_ENDPOINT + '/messages')
      .auth('api', process.env.API_KEY)
      .type('form')
      .send({
        'from': process.env.EMAIL_SENDER,
        'to': newCoupon.email,
        'subject': 'Coffee Coupon',
        'html': renderTemplate(newCoupon),
      })
    return ''
  }
}

