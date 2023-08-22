import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
const { spawn } = require('child_process');

@Injectable()
export class CronService {
    private readonly logger = new Logger(CronService.name);

    @Cron('45 * * * * *')
    handleCron() {
        this.logger.debug('Called when the current second is 45');
        console.log("I'm CRONNING IN CRONSERVICE")
    }

    // seems to call from current working directory (liquid-magic-backend)
    @Cron('45 * * * * *')
    getGasPrice() {
        this.logger.debug('Called when the current second is 45');
        console.log("I'm getting gas price")
        const python = spawn('python', ["src/pythonstuff/index2.py"] );
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
        console.log("finished getting gas price")
    }

    @Cron('15 * * * * *')
    getGasPrice15() {
        this.logger.debug('Called when the current second is 15');
        console.log("I'm getting gas price")
        const spawn = require("child_process").spawn;
        const process = spawn('python', ["src/pythonstuff/index2.py"] );
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
    }
}