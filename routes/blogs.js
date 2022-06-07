var express = require('express')
const res = require('express/lib/response')
var router = express.Router()
//import mongo
var {blogsDB} = require('../mongo.js')



//always async function via(has to be via router method{.get,.post etc})
router.get('/' , async function (req,res,next) {
    try {
        //changed from db.<name of collection>.doSomething() to db.collection('<name of collection>')
        const collection = await blogsDB().collection('posts2')
        const posts2 = await collection.find({}).toArray()
        console.log(posts2)
        res.json(posts2)
    } catch(e) {
        console.log(e)
        res.status(e).send('error fetching data ' + e)
    }
    
})

// get all posts and able to sort them /asc||desc ()
router.get('/all' , async function (req,res,next) {
    let sorted = req.query.sort
    if(sorted === 'asc') {
        sorted = 1
    } else if (sorted === 'desc') {
        sorted = -1
    }
    let filtered = req.query.filter
    // console.log('filtered',filtered)
    // console.log('sorted', sorted)
    try {
        //changed from db.<name of collection>.doSomething() to db.collection('<name of collection>')
        const collection = await blogsDB().collection('posts2')
        if (filtered !== undefined) {
            const posts2 = await collection.find({author:filtered}).toArray()
            res.json(posts2)
        } else if (sorted !== undefined) {
            const posts2 = await collection.find({}).sort({createdAt:sorted}).toArray()
            res.json(posts2)
        }
        
    } catch(e) {
        console.log(e)
        res.status(e).send('error fetching data ' + e)
    }
    
})



router.get('/single-blog/:blogId' , async function (req,res,next) {
  let blogId = Number(req.params.blogId)
  try {
  
    const collection = await blogsDB().collection('posts2')
    const posts2 = await collection.find({}).toArray()
    
    res.json(findBlog(posts2,blogId))
  } catch (e) {
    res.status(500).send("error fetching posts " + e)
  }
    
})

//helper func for query blog db
const findBlog = (postList ,blogId) => {
  const foundBlog = postList.find(ele => ele.id === blogId);
  return foundBlog
}

//display where sample input blog of user will start--POST STEP 1
router.get('/post-blog', function(req, res, next) {
  res.render('post-blog')
});

const inputValidate = (obj) =>{
    //title,text,author,category
    let title = req.body.title
    let text = req.body.text
    let author = req.body.author
    let category = req.body.category
    try {
        if(title === '' || text === '' || author === '' || category === '') throw 'empty input';
        if(typeof title !== 'string' || typeof text !== 'string' || typeof author !== 'string' || typeof category !== 'string') throw 'not a string';
    } catch(e) {
        console.log(e)
        res.json(`error:${e}`)
        // res.status(500).send("wrong inputs " + e)
    }
}
//get data and make into a post
router.post('/submit', async function (req,res,next) {
   // console.log(JSON.stringify(title))
    let title = req.body.title
    let text = req.body.text
    let author = req.body.author
    let category = req.body.category
    // console.log('checking type', typeof parseInt(title))
    try {
        //throw special errors depending on circumstance
        if(title === '') throw 'Title is blank!';
        if(text === '') throw 'text is blank!';
        if(author === '') throw 'author is blank!';
        if(category === '') throw 'category is blank!';
        if(!isNaN(title)) throw 'Title cant be a number';
        if(!isNaN(text)) throw 'Text cant be a number';
        if(!isNaN(author)) throw 'Author cant be a number';
        if(!isNaN(category)) throw 'Category cant be a number';
        
        // if call error handling is not triggered then create post
        const collection = await blogsDB().collection('posts2')
        let posts2 = await collection.find({}).toArray()
        // console.log(posts)
        // res.json(posts)
        const now = new Date()
        let newPost = {
            createdAt:now.toISOString(),
            title:req.body.title,
            text:req.body.text,
            author:req.body.author,
            category:req.body.category,
            lastModified:now.toISOString(),
            id:posts2.length += 1
        }
        //add new post to database
        const addPost = await collection.insertOne(newPost)
        res.json('CREATED POST!')
    } catch(e) {
        console.log(e)
        // res.status(500).send("wrong inputs " + e)
        res.json('Error: ' + e)
    }
  
})



//display website
router.get('/display-blogs', (req,res,next) => {
  res.render('display-blogs')
})

//display single blog
router.get('/display-single-blog',(req,res,next) => {
  res.render('display-single-blog')
  // console.log(req.body)
})


//update blog
router.put('/update-blog/:blogId', async (req,res,next) => {
  // identify information coming in from put req in ejs
  const blogId = Number(req.params.blogId)
  const title = req.body.title
  const text = req.body.text
  const author = req.body.author  
  // const updatedBlogData = {
  //   title,
  //   text,
  //   author
  // }
  // console.log(req.body.title)
  try {
    const collection = await blogsDB().collection('posts2')
    const updatePost = await collection.updateOne(
      {id:blogId},
      {$set:{'title':title, 'text':text , 'author':author}}
    )
    // console.log(updatedBlogList)
    res.json('ok')
  } catch(e) {
    console.log(e)
    res.status(500).send('error fetching posts ' + e)
  }
})

//delete a post
router.delete('/delete-blog/:blogId', async (req,res,next) => {
  //index id of blogpost
  const blogIdToDelete = Number(req.params.blogId)
  try {
    const collection = await blogsDB().collection('posts2')
    const posts2 = await collection.deleteOne({id:blogIdToDelete})
    res.send('deleted blog')
  } catch (e) {
    console.log(e)
    res.status(500).send("error fetching posts " + e)
  }
  
})

//filter post by author name
//always async function via(has to be via router method{.get,.post etc})
router.get('/authors' , async function (req,res,next) {
    try {
        //changed from db.<name of collection>.doSomething() to db.collection('<name of collection>')
        const collection = await blogsDB().collection('posts2')
        const posts2 = await collection.distinct('author')
        // console.log(posts2)
        res.json(posts2)
        // req.json(posts2)
    } catch(e) {
        console.log(e)
        res.status(500).send('error fetching data ' + e)
    }
    
})

// {
// 	"_id" : ObjectId("628d38a163019e865e5b278f"),
// 	"createdAt" : "2022-01-11T02:04:23.863Z",
// 	"title" : "accusantium",
// 	"text" : "Qui quae deleniti hic. Est sint consequatur illo dolor voluptas. Consequatur soluta distinctio. Nisi itaque officia fuga officia temporibus dicta optio. Sed aut exercitationem consequatur omnis quia inventore.\nMinima quas sint quos officia distinctio. Odit quod incidunt modi assumenda. Quae harum hic voluptatem odit dolores non. Perspiciatis iure hic numquam. Incidunt cum soluta dolor quibusdam sapiente excepturi ut quis.\nSint eaque numquam magnam et. Quasi hic consequatur. Ad doloremque sed.",
// 	"author" : "Traci Bins DVM",
// 	"lastModified" : "2022-05-24T13:39:26.182Z",
// 	"category" : "qui",
// 	"id" : 1
// }
module.exports = router;