import { Controller, Get, Logger } from '@nestjs/common';
import { PredictionsService } from './predictions.service';
const fs = require("fs");
const { parse } = require("csv-parse");
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

@Controller('predictions')
export class PredictionsController {
  private readonly logger = new Logger(PredictionsController.name);
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get('yhat')
  async yhat() {
    this.logger.log('Retreiving yhat');
    let coord_arr = [];
    const csv_data = fs.readFileSync("./src/pythonstuff/yhat_current.csv", {encoding: "utf8"});
    const rows = csv_data.split("\n")
    rows.forEach(row => {
      const r = row.split(",")
      coord_arr.push([r[0], r[r.length - 2], r[r.length -1]])
    });
    // last element is null since there is a trailing newline in yhat_current.csv
    coord_arr.pop()
    return coord_arr;
  }
}
