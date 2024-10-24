const homeService = {

    home: (req, res) => {
        res.render('home/home', {loginedAdmin: req.user});

    },
    
}

module.exports = homeService;