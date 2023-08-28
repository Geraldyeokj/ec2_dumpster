import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
const { spawn } = require('child_process');
const path = require('node:path'); 

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    @Cron('*/2 * * * *')
    getYhat() {
        try{
            this.logger.debug('Called every 2 minutes');
            this.logger.log("I'm updating yhat")
            this.logger.log("current directory:", __dirname)
            this.logger.log("calling python program from", path.resolve(__dirname, "../../../"))
            const python = spawn('python3', ["src/pythonstuff/yhat_gen_5.py"], {
                cwd: path.resolve(__dirname, "../../../")
            });

            setTimeout(() => {
                python.kill()
            }, 105*1000, "Yhat child process took too long")

            python.stdout.on('data', (data) => {
                console.log('pattern: ', data.toString());
            });
            
            python.stderr.on('data', (data) => {
                console.error('err: ', data.toString());
            });
            
            python.on('error', (error) => {
                console.error('error: ', error.message);
            });
            
            python.on('close', (code) => {
                console.log('child process exited with code ', code);
            });
            console.log("finished generating yhat graph")
        } catch (err) {
            console.warn(`Failed to generate yhat. Error: ${err}`)
        }
    }

    @Cron('15 * * * * *')
    getGasPrice15() {
        try {
            this.logger.debug('Called when the current second is 15');
            console.log("I'm getting gas price", __dirname, path.resolve(__dirname, "../../../"))
            const spawn = require("child_process").spawn;
            const process = spawn('python3', ["src/pythonstuff/index2.py"], {
                cwd: path.resolve(__dirname, "../../../")
            });
            setTimeout(() => {
                process.kill()
            }, 60*1000, "Get gas price took too long")
            process.stdout.on('data', (data) => {
                console.log('pattern: ', data.toString());
            });
            
            process.stderr.on('data', (data) => {
                console.error('err: ', data.toString());
            });
            
            process.on('error', (error) => {
                console.error('error: ', error.message);
            });
            
            process.on('close', (code) => {
                console.log('child process exited with code ', code);
            });
            console.log("finished getting gas price")
        } catch (err) {
            console.warn(`Failed to get gas price. Error: ${err}`)
        }
    }
}
