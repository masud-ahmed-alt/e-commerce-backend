const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const ApiFeatures = require('../utils/apifeatures')

// Create Product-- Admin
exports.createProduct = catchAsyncErrors(async (req, resp, next) => {


    req.body.user = req.user.id

    const product = await Product.create(req.body)
    resp.status(201).json({
        success: true,
        product
    })
})



// Get all Products 
exports.getAllProducts = catchAsyncErrors(async (req, resp) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    const products = await apiFeature.query;
    resp.status(200).json({
        success: true,
        products,
        productCount
    });
});

// Get Product Details 

exports.getProductDetails = catchAsyncErrors(async (req, resp, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    else {
        resp.status(200).json({
            success: true,
            product
        })
    }
});

// update Product Admin 

exports.updateProduct = catchAsyncErrors(async (req, resp, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    } else {
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });
        resp.status(200).json({
            success: true,
            product
        })
    }
});


// Delete Product Product 

exports.deleteProduct = catchAsyncErrors(async (req, resp, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    } else {
        await product.remove();
        resp.status(200).json({
            success: true,
            message: "Product Deleted Successfully"
        });
    }
});

//  Create new Review or update the review

exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
    });
});


//   Get All reviews of a product


exports.getProductReviews = catchAsyncErrors(async (req, resp, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 400));
    }

    resp.status(200).json({
        success: true,
        reviews: product.reviews
    });
});


// Delete Product reviews
exports.deleteProductReviews = catchAsyncErrors(async (req, resp, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found", 400));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString())

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    const ratings = avg / reviews.length;

    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })
    resp.status(200).json({
        success: true
    });

})