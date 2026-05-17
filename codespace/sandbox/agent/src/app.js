import express from 'express';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(morgan('dev'));
app.use(express.json());


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the agent!',status:'success' });
});

const WORKSPACE_DIR = '/workspace';

app.get('/list-files', async (req, res) => {
    // Recursive function to list all files safely
    const Listfiles = async (dir, baseDir) => {
        let files = [];
        try {
            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(baseDir, fullPath);
                
                // Sahi format ignore list check karne ka
                if (entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    const subFiles = await Listfiles(fullPath, baseDir);
                    files.push(...subFiles);
                } else {
                    files.push(relativePath);
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error);
        }
        return files; 
    };

    try {
        const files = await Listfiles(WORKSPACE_DIR, WORKSPACE_DIR);
        res.status(200).json({
            message: "file listed successfully",
            status: "success",
            files
        });
    } catch (err) {
        res.status(500).json({
            message: `error listing files: ${err.message}`,
            status: 'error'
        });
    }
});

app.get('/read-files',async(req,res)=>{
    const files = req.query.files
    if(!files){
        return res.status(400).json({
            message:"No files specified in query parameter",
            status:'error'
        })
    }
    const filesList = files.split(',');
    const result = await Promise.all(filesList.map(async (file)=>{
        const filePath = path.join(WORKSPACE_DIR,file);
        try{
            const content = await fs.promises.readFile(filePath,'utf-8')
            return{
                [filePath.replace(WORKSPACE_DIR,'')]:content
            }
        }catch(err){
            return {
                [filePath.replace(WORKSPACE_DIR,'')]:`ERROR reading file:${err.message}`
            }
        }
    }));
    res.status(200).json({
        message:'file content',files:result
    })
})

app.patch('/update-files',async(req,res)=>{
    const updates = req.body.updates

    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({
            message:"Invaild request body, expected a JSON object with an updates property containing array of file updates",
            status:"error"
        })
    }

    const results = await Promise.all(updates.map(async (update)=>{
        const {file,content} = update;
        const filePath = path.join(WORKSPACE_DIR,file)
        try{
            await fs.promises.mkdir(path.dirname(filePath),{recursive:true})
            await fs.promises.writeFile(filePath,content,'utf-8')
            return{
                [filePath]:'file update successfully'
            }    
        }catch(err){
            return {
                [filePath]:`ERROR updating file:${err.message}`
            }
        }
    }));
    res.status(200).json({
        message:"file update",
        results
    })
})
app.post('/create-files',async(req,res)=>{
    const files = req.body.files;

    if(!files || !Array.isArray(files)){
        return res.status(400).json({
            message:"Invaild request body, expected a JSON object with an 'files' property containing array of files",
            status:"error"
        })
    }

    const results = await Promise.all(files.map(async (fileObj)=>{
        const {file,content} = fileObj;
        const filePath = path.join(WORKSPACE_DIR,file)
        try{
            await fs.promises.mkdir(path.dirname(filePath),{recursive:true})
            await fs.promises.writeFile(filePath,content,'utf-8')
            return{
                [filePath]:'file create successfully'
            }    
        }catch(err){
            return {
                [filePath]:`ERROR creating file:${err.message}`
            }
        }
    }));
    res.status(200).json({
        message:"file created",
        results
    })
})


export default app;