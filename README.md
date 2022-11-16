# e-commerce-backend
This nodejs api application on e-commerce application

<h1>How to install?</h1>

<h6>After clone this repo</h6>
<h6>Goto e-commerce directory on console, make sure your machine has installed NODE</h6>
<h5>then run the command</h5>
<h3>npm install</h3>
<h6>it will install all packages used in this project into your pc</h6>

<h5>then run the command for start the application</h5>
<h3>nodemon dev</h3>
<h6>Then you will get this output</h6>

<h5>Server is working on http://localhost:4000</h5>
<h5>Mongodb connected with server :127.0.0.1</h5>

<h2>Now open postman and test api's.</h2>

<h3>For Products</h3>

<h4>Create Product -> http://localhost:4000/api/v1/products/new</h4>
<p>body</p>
{
"name":"Product 1",
"price":1200,
"description": "This is a sample product",
"category":"laptop",
"images":{
"public_id":"sample images",
"url":"sampleUrl"
}
}

<h4>Get All Products-> http://localhost:4000/api/v1/products</h4>

<h4>Update Product Admin -> http://localhost:4000/api/v1/products/product_id</h4>
<p>body</p>
{
"name":"Apple",
"price":2000,
"description": "This is a sample product",
"category":"Mobile",
"images":{
"public_id":"sample images",
"url":"sampleUrl"
}
}

<h4>Delete Product-> http://localhost:4000/api/v1/products/product_id</h4>

<h4>Get Single Product-> http://localhost:4000/api/v1/products/product_id</h4>


<h3>Authentication</h4>
    <h4>Register User-> http://localhost:4000/api/v1/register</h4>
    <p>body</p>
    {
    "name":"Masud Ahmed",
    "email":"masud@test3.com",
    "password": "password"
    }

    <h4>Login User->http://localhost:4000/api/v1/login</h4>
    <p>body</p>
    {
    "email":"masudtest@gmail.com",
    "password":"password"
    }

    <h4>Logout User-> http://localhost:4000/api/v1/logout</h4>

    <h4>Forgot Password-> http://localhost:4000/api/v1/password/forgot</h4>
    <p>body</p>
    {
    "email":"test@gmail.com"
    }


    <h4>Reset Password -> http://localhost:4000/api/v1/password/reset/user_id</h4>
    <p>body</p>
    {
    "password":"00000000",
    "confirmPassword":"00000000"
    }
