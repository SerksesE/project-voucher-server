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
    //checks if coupon exists
    const coupon = await Coupon.findOneOrFail({ uuid: uuid })
    if (!coupon) throw new NotFoundError('invalid coupon id')
    //checks if coupon is already used
    if (coupon.used_at) throw new BadRequestError('coupon already used on ' + new Date(coupon.used_at))
    // 15 days in milliseconds
    const fifteen_days = 15 * 24 * 60 * 60 * 1000
    //if the date today minus 15 days(so 15 days ago) is higher then the created_at date, the coupon expired
    if (new Date(Date.now() - fifteen_days) > new Date(coupon.created_at)) throw new BadRequestError('activation date expired')
    //adds the activation date to coupon
    return Coupon.merge(coupon, { used_at: new Date(Date.now()) }).save()
  }

  @Post('/coupons')
  @HttpCode(201)
  async postCoupon(
    @Body() ctx: Context,
  ) {
    //user. became coupon (cause we're not using that table anymore)

    // if(!ctx.form_response.answers) throw new NotFoundError('')

    // const email = getEmail(ctx.form_response) {
    //   if(ctx.from_response) {throw new NotFoundError('error')}
    // }

    const newCoupon = Coupon.create({
      email: ctx.form_response.answers.filter(answer => answer.type === 'email')[0].email,

      // adds the date when a new coupon is created
      // created_at: new Date(Date.now()),
      //connects the coupon to the form


      forms: await Form.findOne({ typeform_id: ctx.form_response.form_id }),
    })
    //saves the newly created coupon
    await newCoupon.save()
   
    //checks if id is null or not, cause in typescript it's better not to make assumptions something exists
    if (!newCoupon || !newCoupon.id) throw new NotFoundError('Invalid coupon')

    //when you change something in the config (non pushed file) please make sure to notify the team
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

