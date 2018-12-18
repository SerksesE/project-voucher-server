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

      // Check if locations uva exists
      Location.findOne({ name: 'UvA' })
        .then(location => {
          if (!location) {
            //if it does not exist we make a location named uva 
            Location.create({
              name: 'UvA',
              logo: 'https://www.dropbox.com/s/gcycga700r7ih5r/Enjoy%20Today%20logo%20white%20transparent.png?dl=1',
              background_color: '#F7F7F7',
              button_color: '#7EC683',
              coffee_image: 'https://www.dropbox.com/s/ol19mjawhni4tm4/Coffee%20cup%20icon.png?dl=1',
              coupon_image: 'https://www.dropbox.com/s/9kkyibw7ef7kdoa/Coupon%20-%20empty.png?dl=1'
            }).save()
              .then(location => {
                //checks if form already exists
                Form.findOne({ typeform_id: 'hzCA6t' })
                  .then(form => {
                    //if not it makes one and we connect it to the location, witht he location:location
                    if (!form) {
                      Form.create({ typeform_id: 'hzCA6t', location: location, barcode: 'https://i.redd.it/ig5u8ke5qo421.png' }).save()
                    }
                  })
              })
          }
        })
    })