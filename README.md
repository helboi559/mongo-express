# mongo-express

## Express/Mongo Setup

- Express Setup - Express Generator NPM

  - run 'npx express-generator -e' in the project folder - Install
  - run 'npm i nodemon --save-dev' - add dependency
  - add scripts if needed(nodemon etc.)
  - .env folder (ports, passwords etc)

- Mongo Setup - Via Node (within project)

  - run "npm i mongodv dotenv" - to isntall package
  - [MongoLinks](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/)
  - Add the following env variables to the .env file and set their value to YOUR configurations (replace angle brackets with your values)
    ```js
     MONGO_URI = mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority
     MONGO_DATABASE = <DBNAME>
    ```
  - Create mongo.js file to "connect" to client and pull the database from the server. Paste code:

    ```js
    const { MongoClient } = require("mongodb");
    //get access to env variables file in project
    require("dotenv").config();

    let db;

    async function mongoConnect() {
      // Connection URI
      const uri = process.env.MONGO_URI;
      // Create a new MongoClient how to connect
      const client = new MongoClient(uri);
      try {
        // Connect the client to the server
        await client.connect();
        db = await client.db(process.env.MONGO_DATABASE);
        // Establish and verify connection
        console.log("db connected");
      } catch (error) {
        throw Error("Could not connect to MongoDB. " + error);
      }
    }
    function blogsDB() {
      return db;
    }
    module.exports = {
      mongoConnect,
      blogsDB,
    };
    ```

  - Import "mongoConnect" Function in app.js. ENSURE ITS BELOW ALL ROUTES BUT ABOV EXPRESS
    ```js
    var { mongoConnect } = require("./mongo.js");
    mongoConnect();
    ```

## Setup express routing

- Sample Routing

  - Create a new GET route /datetime that will send the current date and time as a string to the browser. Hint: The method new Date() will create a new date object that has methods for retrieving the current date and time as strings.
  - Create a new GET route /users/myname in the users.js routes file. The route should return your name to the browser.
  - Create a new GET route /users/myfavoritemovies in the users.js routes file. The route should return your three favorite movies in an array to the browser. Hint: You may need to use res.json() instead of res.send().
  - Stretch goal: Use res.render to render the above routes using the index.ejs template and modify the index.ejs template as needed. Or create your own users.ejs template.

- Routing with mongo

  - Before we can display whats in mongo after setting the routes is import mongos db via 'blogsDB'.

    ```js
    //import mongo
    const { blogsDB } = require("../mongo.js");
    ```

* Create a new base route called /blogs. Copy the sampleBlogs.js file into your project and use require to import blogPosts into your file. Create a new GET route /blogs/all that returns an array of all the blog posts to the browser.

  ```js
  router.get("/all", async function (req, res, next) {
    try {
      //changed from db.<name of collection>.doSomething() to db.collection('<name of collection>')
      const collection = await blogsDB().collection("posts2");
      const posts2 = await collection.find({}).toArray();
      console.log(posts2);
      res.json(posts2);
    } catch (e) {
      console.log(e);
      res.status(e).send("error fetching data " + e);
    }
  });
  ```

* Create and update GET routes nested under /blogs. /blogs/:blogId should return only a single blog post that matches the id field of the blog post to the blogId route param. Add query param handling to the /blogs/all route. The ?sort param should behave as follows: if ?sort=desc, the blog posts should be sorted by descending order based upon createdAt date; if ?sort=asc, the blog posts should be sorted by ascending order instead. Hint: use the .sort() method to sort the blogs.

### CRUD OPERATIONS - Create a post

- Create a new file in /views called postBlog.ejs, copy and paste the provided code into it. Note that jquery is imported, there are user input fields and a button that sends a POST request.
  - Create a new route /postblog and use the res.render() method to display this page to the browser.
  - Create a new POST route /blogs/submit, it should receive the new blog post information from the browser and add it to the array of blogs in sampleBlogs.js. Note that the createdAt and the id are NOT provided from the front end. You will have to create those two fields yourself server-side and add them to the incoming blog post data before adding it to the blogPosts array. Don't forget to send an "OK" response to the browser after the save!
  - Test your new route by adding a blog post via the browser and then retrieving the blog posts. /blogs/all should still work by returning all the posts, and the ?sort param should still work. /blogs/:blogId should be able to retrieve the new blog post by itself by passing in 6 as the blogId.

### CRUD OPERATIONS - Read a post(s).

- Build out your blog site by adding the following features
  - Create a new file in /views called displayBlogs.ejs, copy and paste the provided code into it
  - Create a new GET route /blogs/displayBlogs that will render the displayBlogs page to the browser. Test that the basic functionality of the page is working by clicking the Get Blogs button, your various blog titles should appear in a list. Test that your postBlog page is still working by adding a new blog then go back to displayBlogs and click Get Blogs again. Your new blog title should appear on the page.
  - Build out the displayBlogs page functionality by displaying the blog text and author to the page along with the title.
  - Implement the ability for the user to sort blogs by ascending and descending. Hint: the easiest way to do this is to add two new <a> tags to the page which redirect the user to "http://localhost:4000/blogs/all?sort=asc" and "http://localhost:4000/blogs/all?sort=desc".
  - Stretch Goal: Instead of the two <a> tag redirects, add a dropdown that has two options "asc" and "desc". Impelment jQuery functionality to modify the $.get "http://localhost:4000/blogs/all" url to send through the user selected sort order as query params when the user clicks the "Get Blogs" button.
  - Create a new file in /views called displaySingleBlog.ejs, copy and paste the provided code into it
  - Create a new GET route /blogs/displaysingleblog that will render the displayBlogs page to the browser. Test that the page and /blogs/singleblog/:blogId route works by entering a blogId into the input field and clicking "Get Single Blog"

### CRUD OPERATIONS - Update a post

- Implement the PUT route for modifying a single blog. It will be a new route in blogs.js. You can copy much of the html and functionality from postBlog.ejs into displaySingleBlog.ejs. Except now when you make the PUT request, you'll have to send through the blogId you want to modify as a route param (similar to the DELETE route you just created), get the values from the input fields using jQuery, and send those through with the PUT request to update the specified blog.

### CRUD OPERATIONS - Delete a post

- Implement the delete single blog functionality. Hint: you will have to create a new route in the blogs.js file to handle the delete. The route should use a ROUTE PARAM to specify which blog to delete. I.E. /blogs/deleteblog/:blogId.

* Stretch Goal 1: Add field level validation to the new blog post submit functionality. I.E. for the /submit route, check to see that the user has correctly inputted all required fields and that they are the correct type. If the validation fails, do not let the user save the post.
* Stretch Goal 2: If there is a validation level error (such as a user not including an author name on a new post), send that specific error to the client/browser and display it so the user can see it. The user should be able to adjust their input values as necessary and resubmit.
* Stretch Goal 3: Add the frontend and backend functionality necessary to display all blogs submitted by a particular author by adding a dropdown menu with the author list. Approach:
  - Create a new GET route /authors that returns a list of authors to the browser. You may need to make a new button in the browser that will fetch this list from the server onClick.
  - Display the fetched list of authors as a dropdown field.
  - When the user selects a particular author from the dropdown, the browser should make a request to the /blogs/all route with the author as a filter param. The response should be a list of blog posts for that particular author. Display that list of fetched blogs to the user on the page.
