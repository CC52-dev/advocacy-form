import express from 'express';
const router = express.Router()

router.get('/new', (req, res) => {
    const formdata = req.body
    res.json({'message': 'Hello Form!'});
});

router.post('/checkemail/:user', (req, res) => {
    const email = req.params.user
    console.log(email)    
    if (email === 'test@test.com') {
        res.json({'result': false});
    } else {
        res.json({'result': true});
    }
});


router.post('/new', (req, res) => {
    const formdata = req.body
    console.log(formdata)
    res.json({'result': true});
});
export default router;