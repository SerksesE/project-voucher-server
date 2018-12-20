import { createConnection } from 'typeorm'
import { DefaultNamingStrategy } from 'typeorm/naming-strategy/DefaultNamingStrategy'
import { NamingStrategyInterface } from 'typeorm/naming-strategy/NamingStrategyInterface'
import { snakeCase } from 'typeorm/util/StringUtils'
import Form from './forms/entity';
import Location from './locations/entity';
import Coupon from './coupons/entity';


class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {

  tableName(targetName: string, userSpecifiedName: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName) + 's';
  }

  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCase(embeddedPrefixes.concat(customName ? customName : propertyName).join("_"));
  }

  columnNameCustomized(customName: string): string {
    return customName;
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }
}

export default () =>
  createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres',
    entities: [
      Form,
      Location,
      Coupon
    ],
    synchronize: true,
    logging: true,
    namingStrategy: new CustomNamingStrategy()
  })
    .then(_ => {
      console.log('Connected to Postgres with TypeORM ')

      Location.findOne({ name: 'UvA' })
        .then(location => {
          if (!location) {
            Location.create({
              name: 'UvA',
              logo: 'https://www.dropbox.com/s/gcycga700r7ih5r/Enjoy%20Today%20logo%20white%20transparent.png?dl=1',
              background_color: '#F7F7F7',
              button_color: '#7EC683',
              button_text_color: '#FFFFFF',
              coffee_image: 'https://www.dropbox.com/s/ol19mjawhni4tm4/Coffee%20cup%20icon.png?dl=1',
              coupon_image: 'https://www.dropbox.com/s/9kkyibw7ef7kdoa/Coupon%20-%20empty.png?dl=1',
              free_color: '#F69180',
              coffee_color: '#9B815D',
              courtesy_color: '#8C8C8C'
            }).save()
              .then(location => {
                Form.findOne({ typeform_id: 'hzCA6t' })
                  .then(form => {
                    if (!form) {
                      Form.create({ typeform_id: 'hzCA6t', location: location, barcode: 'https://www.dropbox.com/s/yqgyq9935krvnit/Barcode.png?dl=1' }).save()
                    }
                  })
              })
          }
        })
    })
    .then(_ => {
      Location.findOne({ name: 'TU Delft' })
        .then(location => {
          if (!location) {
            Location.create({
              name: 'TU Delft',
              logo: 'https://www.dropbox.com/s/tfgw9692cdvqouh/TU%20Delft%20logo%20-%20fire.png?dl=1',
              background_color: '#F7F7F7',
              button_color: '#C4F7A1',
              button_text_color: '#4C8290',
              coffee_image: 'https://www.dropbox.com/s/k7kwnyj8auvtl8i/Coffee%20cup%20-%20TU%20Delft.png?dl=1',
              coupon_image: 'https://www.dropbox.com/s/q5ixi3tn5byobx6/Blank%20coupon%20-%20TU%20Delft.png?dl=1',
              free_color: '#FFFFFF',
              coffee_color: '#4C96D2',
              courtesy_color: '#F7F7F7'
            }).save()
              .then(location => {
                Form.findOne({ typeform_id: 'gXFYS5' })
                  .then(form => {
                    if (!form) {
                      Form.create({ typeform_id: 'gXFYS5', location: location, barcode: 'https://www.dropbox.com/s/yqgyq9935krvnit/Barcode.png?dl=1' }).save()
                    }
                  })
              })
          }
        })
    })