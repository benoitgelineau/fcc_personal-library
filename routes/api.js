/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var ObjectId = require('mongodb').ObjectId;

module.exports = function (app, db) {

  app.route('/api/books')
    .get(function (req, res){

      db.collection('books')
        .find()
        .project({ comments: 0 })
        .toArray((err, data) => res.send(data));
    })
    
    .post(function (req, res){
      var title = req.body.title;
      
      if (!title) {
        res.status(400).send('Please insert the book title');
      } else {
        
        db.collection('books').insertOne(
          {
            title: title,
            comments: [],
            commentcount: 0
          },
          (err, data) => {
            const book = data.ops[0];
  
            res.status(201).json(
              {
                title: book.title,
                _id: book._id
              }
            )
          }
        );
      }
    })
    
    .delete(function(req, res){

      db.collection('books').deleteMany({}, (err, data) => {
        
        const message = data.deletedCount > 0 ? 'complete delete successful' : 'the library is already empty';

        res.send(message);
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;

      db.collection('books')
        .findOne(
          { _id: ObjectId(bookid) },
          { commentcount: 0 },
          (err, data) => {

            if (!data) {
              res.status(400).send('no book exists');
            } else {
              res.send(data)
            }
          }
        );
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      
      db.collection('books')
        .findOneAndUpdate(
          { _id: ObjectId(bookid) },
          {
            $push: {
              comments: comment
            },
            $inc: {
              commentcount: 1
            }
          },
          {
            projection: { commentcount: 0 },
            returnNewDocument: true
          },
          (err, data) => {

            res.status(201).send(data.value);
          }
        );
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;

      db.collection('books').deleteOne(
        { _id: ObjectId(bookid) },
        {},
        (err, data) => {
          let message;

          if (data.deletedCount < 1) {
            message = `could not delete ${bookid}`;
          } else {
            message = `delete successful`;
          }

          res.send(message);
        }
      );
    });
  
};
