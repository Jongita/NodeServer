
import { Student } from "./models/students";

import mysql from 'mysql2';

import http from 'http';

import fs from 'fs';
import path from "path";

// kintamasis kuris rodo ar mes prisijunge prie duomenu bazes
let connected=false;

// si dalis sukuria prisijungima prie duomenu bazes
const con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Jurgita1981",
    database:"students"
});

///Prisijungia prie duomenų bazės
// con.connect();
// con.connect( funkcija kuri bus vykdoma po prisijungimo )
con.connect((error:any)=>{
 if (error) throw error;

 //Po prisijungimo be klaidos, nustatome jog esame prisijungę prie DB
 connected=true;

 console.log("Prisijungta");
 
});



//Sukuriame http serverį ir paduodame f-ją kuri bus vykdoma kai ateis užklausa
const server=http.createServer((req, res)=>{
    const url=req.url;
    const method=req.method;
    
    /*
    //Jei kažkas atėjo į puslapį su GET metodu į url: localhost:2999/students, Galime jam išsiųsti JSON formatu duomenis
    if (url=='/students' && method=='GET'){
        if (connected){
            con.query<Student[]>("SELECT * FROM students ORDER BY name ASC;", (error,result)=>{
                if (error) throw error;
                res.setHeader("Content-Type", "text/JSON; charset=utf-8");
                res.write(JSON.stringify(result));        
                res.end();
            });   
        }
    }
    */


    //Dalis skirta statiniem failam išvesti
    let filePath=`public${url}`;
    // fs.existsSync("kelias iki failo")  - patikrina ar failas,katalogas, likas egzistuoja, jei taip, tai garažina 'true', jei ne 'false'
    // fs.lstatSync(filePath).isFile()  -patikrina ar tai failas (ne katalogas, nuoroda, įrenginys)
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()){
        const ext=path.extname(filePath);
        switch (ext) {
            case ".css":
                res.setHeader("Content-Type", "text/css; charset=utf-8");
                break;
            case ".js":
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
                break;
            case ".jpg":
            case ".png":
            case ".jpeg":
                res.setHeader("Content-Type", "image/jpg; charset=utf-8");
                break;
        
        }
        let file=fs.readFileSync(filePath);
        res.write(file);
        return res.end();
    }





     //Jei kažkas atėjo į puslapį su GET metodu į url: localhost:2999/students, išsiunčiame jam studentų sąrašą HTML formatu
    if (url=='/students' && method=='GET'){
        if (connected){
            con.query<Student[]>("SELECT * FROM students ORDER BY name ASC;", (error,result)=>{
                if (error) throw error;
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                let rows="";
                result.forEach((s)=>{ 
                    rows+="<tr>";
                    rows+=`<td>${s.name}</td> <td>${s.surname}</td> <td>${s.phone}</td> <td> <a href='/student/${s.id}' class="btn btn-success">Plačiau</a></td>`;
                    rows+="</tr>";
                });
               
                let template=fs.readFileSync('templates/students.html').toString();
                template=template.replace('{{ students_table }}', rows);
              
                res.write(template);        
                res.end();
            });   
        }
    }

    //Vieno studento atvaizdavimas, kai url = localhost:2999/student/5
    console.log(url?.split("/"));
    if ( url?.split("/")[1] == 'student' ){
        //Pasiimame iš url id
        let id=parseInt(url?.split("/")[2]);
        con.query<Student[]>(`SELECT * FROM students WHERE id=${id};`, (error,result)=>{
            if (error) throw error;
            let student=result[0];
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            
            let template=fs.readFileSync('templates/student.html').toString();
            template=template.replace("{{ name }}", student.name);
            template=template.replace("{{ surname }}", student.surname);
            template=template.replace("{{ phone }}", student.phone!=null?student.phone:'-');
            template=template.replace("{{ sex }}", student.sex!=null?student.sex:'-');
            template=template.replace("{{ email }}", student.email!=null?student.email:'-');
            template=template.replace("{{ birthday }}", student.birthday!=null?student.birthday.toLocaleDateString():'-');
            
          
            res.write(template);        
            res.end();
        });
        
        
    }


})

    //paleidziame serveri
    server.listen(2999, 'localhost');
