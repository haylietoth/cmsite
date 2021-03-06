/*jslint node: true */
/*jshint esnext: true */
"use strict";

/**
 * Module dependencies.
 */
const Prismic = require('prismic-javascript');
const PrismicDOM = require('prismic-dom');
const app = require('./config');
const Cookies = require('cookies');
const PrismicConfig = require('./prismic-configuration');
const PORT = app.get('port');

app.listen(PORT, () => {
  process.stdout.write(`Point your browser to: http://localhost:${PORT}\n`);
});

// Middleware to inject prismic context
app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: PrismicConfig.apiEndpoint,
    linkResolver: PrismicConfig.linkResolver,
  };
  // add PrismicDOM in locals to access them in templates.
  res.locals.PrismicDOM = PrismicDOM;
  Prismic.api(PrismicConfig.apiEndpoint, {
    accessToken: PrismicConfig.accessToken,
    req,
  }).then((api) => {
    req.prismic = { api };
    next();
  }).catch((error) => {
    next(error.message);
  });
});

// Query the site layout with every route
app.route('*').get((req, res, next) => {
  req.prismic.api.getSingle('menu')
  .then(function(menuContent){

    // Define the layout content
    res.locals.menuContent = menuContent;
    next();
  });
});


/*
 * -------------- Routes --------------
 */

/*
 * Preconfigured prismic preview
 */
app.get('/preview', (req, res) => {
  const token = req.query.token;
  if (token) {
    req.prismic.api.previewSession(token, PrismicConfig.linkResolver, '/')
    .then((url) => {
      const cookies = new Cookies(req, res);
      cookies.set(Prismic.previewCookie, token, { maxAge: 30 * 60 * 1000, path: '/', httpOnly: false });
      res.redirect(302, url);
    }).catch((err) => {
      res.status(500).send(`Error 500 in preview: ${err.message}`);
    });
  } else {
    res.send(400, 'Missing token from querystring');
  }
});

/*
 * Page route
 */
app.get('/:uid', (req, res, next) => {
  // Store the param uid in a variable
  const uid = req.params.uid;

    if (uid == 'photos') {
      // Get a page by its uid
      req.prismic.api.getByUID("photos", uid)
      .then((pageContent) => {
        if (pageContent) {
          res.render('photos', { pageContent });
        } else {
          res.status(404).render('404');
        }
      })
      .catch((error) => {
        next(`error when retriving page ${error.message}`);
      });
    }
    else if (uid == 'videos'){
      // Get a page by its uid
      req.prismic.api.getByUID("videos", uid)
      .then((pageContent) => {
        if (pageContent) {
          res.render('videos', { pageContent });
        } else {
          res.status(404).render('404');
        }
      })
      .catch((error) => {
        next(`error when retriving page ${error.message}`);
      });
    }
    else if (uid == 'contact'){
      // Get a page by its uid
      req.prismic.api.getByUID("contact", uid)
      .then((pageContent) => {
        if (pageContent) {
          res.render('contact', { pageContent });
        } else {
          res.status(404).render('404');
        }
      })
      .catch((error) => {
        next(`error when retriving page ${error.message}`);
      });
    }
    else if (uid == 'collection'){
      // Get a page by its uid
      req.prismic.api.getByUID("collection", uid)
      .then((pageContent) => {
        if (pageContent) {
          res.render('collection', { pageContent });
        } else {
          res.status(404).render('404');
        }
      })
      .catch((error) => {
        next(`error when retriving page ${error.message}`);
      });
    }
    else {
      // Get a page by its uid
      req.prismic.api.getByUID("page", uid)
      .then((pageContent) => {
        if (pageContent) {
          res.render('page', { pageContent });
        } else {
          res.status(404).render('404');
        }
      })
      .catch((error) => {
        next(`error when retriving page ${error.message}`);
      });
    }
});

/*
 * Homepage route
 */
app.get('/', (req, res, next) => {
  req.prismic.api.getSingle("homepage")
  .then((pageContent) => {
    if (pageContent) {
      res.render('homepage', { pageContent });
    } else {
      res.status(404).send('Could not find a homepage document. Make sure you create and publish a homepage document in your repository.');
    }
  })
  .catch((error) => {
    next(`error when retriving page ${error.message}`);
  });
});
