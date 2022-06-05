var express = require('express')
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
    try {
        //changed from db.<name of collection>.doSomething() to db.collection('<name of collection>')
        const collection = await blogsDB().collection('posts2')
        const posts2 = await collection.find({}).toArray()
        console.log(posts2)
        posts2.sort((a,b)=> {
      
        if(sorted === 'asc') {
            if(a.createdAt < b.createdAt) {
            return -1
            }
            if(a.createdAt > b.createdAt) {
            return 1
            }
        }
        if(sorted === 'desc') {
            if(a.createdAt > b.createdAt) {
            return -1
            }
            if(a.createdAt < b.createdAt) {
            return 1
            }
        }
        return 0
        })
        res.json(posts2)
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

//get data and make into a post
router.post('/submit', async function (req,res,next) {
   // console.log(JSON.stringify(title))
  try {
    const collection = await blogsDB().collection('posts2')
    let posts2 = await collection.find({}).toArray()
    // console.log(posts)
    // res.json(posts)
    const now = new Date()
    let newPost = {
      title:req.body.title,
      text:req.body.text,
      author:req.body.author,
      createdAt:now.toISOString(),
      id:posts2.length += 1
    }
    //add new post to database
    const addPost = await collection.insertOne(newPost)
    
    res.send('successful')
  } catch (e) {
    console.log(e)
    res.status(500).send("error fetching posts " + e)
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

module.exports = router;