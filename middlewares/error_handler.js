const error_handler = (err,req,res,next) => {
    console.log(err.stack)
    res.status(500).send(err.message)
} 

export default error_handler