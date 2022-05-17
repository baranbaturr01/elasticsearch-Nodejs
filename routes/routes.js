const express = require('express')

const router = express.Router()

const elastic = require('elasticsearch')

const bodyParser = require('body-parser').json()

const elasticClient = elastic.Client({ //elastic sunucusu ayaga kalktı
    host: 'localhost:9200'
})

let products = [
    { "Name": "Cheese", "Price": 2.50, "Location": "Refrigerated foods" },
    { "Name": "Crisps", "Price": 3, "Location": "the Snack isle" },
    { "Name": "Pizza", "Price": 4, "Location": "Refrigerated foods" },
    { "Name": "Chocolate", "Price": 1.50, "Location": "the Snack isle" },
    { "Name": "Self-raising flour", "Price": 1.50, "Location": "Home baking" },
    { "Name": "Ground almonds", "Price": 3, "Location": "Home baking" }
]

router.use((req, res, next) => {
    elasticClient.index({
        index: 'logs',
        body: {
            url: req.url,
            method: req.method
        }
    }).then(res => {
        console.log('Logs indexed');
    }).catch(err => {
        console.log(err);
    })
    next()
})

router.post('/products', bodyParser, (req, res, next) => {
    elasticClient.index({
        index: 'products',
        body: req.body
    }).then(response => {
        return res.status(200).json({
            message: 'product indexed',
            response: response
        })
    }).catch(err => {
        return err.status(500).json({
            msg: 'Error',
            err
        })
    })
})

router.get('/products/:id', (req, res, next) => {
    let query = {
        index: 'products',
        id: req.params.id
    }
    elasticClient.get(query).then(response => {
        if (!response) {
            return res.status(404).json({
                product: response
            })
        }
        return res.status(200).json({
            product: response
        })
    }).catch(err => {
        return res.status(500).json({
            message: 'Error not found',
            err
        })
    })
})

router.delete('/products/:id', (req, res, next) => {

    return elasticClient.delete({
        index: 'products',
        id: req.params.id
    }).then(response => {
        return res.status(200).json({
            message: 'Product deleted'
        }).catch(err => {
            return res.status(404).json({
                message: 'Error',
                err
            })
        })
    })
})

router.get('/products', (req, res, next) => {
    let query = {
        index: 'products'
    }
    if (req.query.product) {
        query.q = `*${req.query.product}*`
    }
    return elasticClient.search(query).then(response => {
        return res.status(200).json({
            products: response.hits.hits
        })
    }).catch(err => {
        return res.status(500).json({
            message: 'Error', err
        })
    })
})

module.exports = router