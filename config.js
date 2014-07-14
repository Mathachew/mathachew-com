var path = require('path'),
    config;

config = {
    development: {
        url: 'http://www.mathachew.com',
        mail: {
            transport: 'SMTP',
            options: {
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            }
        },
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost-dev.db')
            },
            debug: false
        },
        server: {
            host: '127.0.0.1',
            port: process.env.PORT
        }
    },
    production: {
        url: 'http://www.mathachew.com',
        mail: {
            transport: 'SMTP',
            options: {
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            }
        },
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost.db')
            },
            debug: false
        },
        server: {
            host: '127.0.0.1',
            port: process.env.PORT
        }
    }
};

module.exports = config;