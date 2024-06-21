const express= require('express');
const router= express.Router();
var fetchUser=require('../middle-ware/fetchUser');
const Note=require('../models/Note');
const {body, validationResult}= require('express-validator');

//get all notes route 1 get
router.get('/fetchallnotes',fetchUser, async (req, res)=>{
    try{
        const notes= await Note.find({user:req.user.id})
        res.json(notes)
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//router2 to add notes POSt /api/notes/addnote
router.post('/addnote',fetchUser, [
   body('title','Enter a valid title').isLength({min:3}),
   body('description','Description must be of atleast 5 characters').isLength({min :5}),
], async (req, res)=>{

    try{
    const {title,description,tag}=req.body;
    const errors=validationResult(req);

    if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()}); 
   }

   const note= new Note({
    title,description,tag,user: req.user.id
   })
   const savedNote= await note.save()
   res.json(savedNote)

  }catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");      
 }
})

//route3 /updatenote  put
router.put('/updatenote/:id',fetchUser, async (req, res)=>{
    const {title,description,tag}= req.body;

    try{
    const newNote={};
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //find the note to be updated and then updating
    let note= await Note.findById(req.params.id);
    if(!note){ return res.status(400).send("Not Found!")}
    if(note.user.toString()!== req.user.id){
        return res.status(401).send("Not Allowed!")
    }

    note= await Note.findByIdAndUpdate(req.params.id, {$set:newNote}, {new:true})
    res.json({note});
   }catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");  
}
 })

 //route4 /deletenote  delete
router.delete('/deletenote/:id',fetchUser, async (req, res)=>{
    const {title,description,tag}= req.body;
    try{
    //find the note to be deleted and then delete
    let note= await Note.findById(req.params.id);
    if(!note){ return res.status(400).send("Not Found!")}
    if(note.user.toString()!== req.user.id){
        return res.status(401).send("Not Allowed!")
    }

    note= await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "Note has been deleted!",  note:note});

   }catch(error){
    console.error(error.message);
    res.status(500).send("Internal Server Error");       
    }
 })
module.exports=router