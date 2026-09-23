const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());


const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://hassanmomin284_db_user:ndA4paPKZXdnljyO@cluster0.l1z7yzc.mongodb.net/BookMart?appName=Cluster0')
    .then(() => console.log('mongoDb is connected'))

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    bio: String,
    profileImage: String
}, {
    versionKey: false
});

const User = mongoose.model('User', userSchema)


app.post('/add-user', async (req, res) => {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(404).json({ message: 'Required All Fields..' })
    }
    if (!/^\S+$/.test(username)) {
        return res.status(404).json({
            message: "Username must not contain spaces",
        });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|in|edu)$/;

    if (!emailRegex.test(email)) {
        return res.status(404).json({ message: "Invalid email format" });
    }
    if (password.length <= 8) {
        return res.status(404).json({ message: "Password must be greater than 8 characters" });
    }

    username = username.toLowerCase();

    const newUser = new User({ username, email, password });
    await newUser.save()

    res.status(201).json({
        message: "User added successfully",
        data: newUser
    });


})

app.post('/login', async (req, res) => {
    let { username, pass } = req.body;
    if (!username || !pass) {
        return res.status(404).json({ message: 'Required All Fields..' })
    }
    username = username.toLowerCase();
    const newUser = await User.findOne({ username });

    if (!newUser) {
        return res.status(404).json({ message: 'Username not Found..!!' })
    }

    if (newUser.password == pass) {
        return res.status(202).json({ message: 'User Login Succesfull..!!', userId: newUser._id })
    }
    res.status(404).json({ message: 'Password is incorrect' })
})

app.post('/setname', async (req, res) => {
    const { Id, name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
        Id,
        { name: name }
    );
    res.json({
        success: true,
        message: 'Name updated',
    });
})

app.get('/users/:Id', async (req, res) => {
    const Id = req.params.Id;
    const newUser = await User.findById(Id)
    res.json(newUser);
})



app.post('/update-profile',async (req, res) => {

    let { Id, name, username, email, bio } = req.body;
    if(!mongoose.isValidObjectId(Id)){
        return res.status(400).json({message:'Invalid or missing userId'})
    }
    let updateData = {};

   if(req.file){
    return console.log('receiving file');
   }


    if (name || username || email || bio) {
        if (name) {
            updateData.name = name;
        }
        if (username) {
            if (username !== username.toLowerCase()) {
                let updatedUser = await User.findById(Id);
                return res.status(404).json({ message: 'UserName Does not required UpperCase', data: updatedUser })
            }
            else {
                updateData.username = username;
            }
        }
        if (bio) {
            updateData.bio = bio;
        }

        if (email) {
            updateData.email = email;
        }
        let updatedUser = await User.findByIdAndUpdate(Id, updateData, { new: true });


        return res.status(201).json({
            message: 'Changes Successfully...',
            data: updatedUser,
        });
    }
    let updatedUser = await User.findById(Id, updateData);
    res.status(404).json({ message: 'Enter Fields for Changes..?', data: updatedUser })

})


const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});