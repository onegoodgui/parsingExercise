import express, {json} from 'express'
import cors from 'cors'
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs'
import {parse} from 'json2csv'


const app = express();
app.use(cors);
app.use(json());
dotenv.config();

const { Pool } = pg;
export const connection = new Pool({
  connectionString: "postgres://postgres:123456@localhost:5432/parsing"
});


interface toJSON {
    name: string,
    owner: string,
    description: string,
    topic: string,
    language: string,
    stars: number

}

async function sponsorshipToJSON(){

const {rows: selection} = await connection.query<toJSON>('SELECT * from repositories WHERE "hasSponsorship" = true ORDER BY stars DESC')
return selection
}


const result = await sponsorshipToJSON()
const sponsoredRepos = result.map((repo) => ({
    name: repo.name,
    owner: repo.owner,
    description: repo.description,
    topic: repo.topic,
    language: repo.language,
    starts: repo.stars
}))

fs.writeFileSync("sponsored-repos.json", JSON.stringify(sponsoredRepos))

const reposJSON = fs.readFileSync('sponsored-repos.json');
const repos = JSON.parse(reposJSON.toString());
const csv = parse<toJSON>(repos);
console.log(csv);
fs.writeFileSync("most-famous-sponsored-repos.csv", csv)

const port = process.env.PORT || 5000
app.listen( port , () => {
    console.log(`running on ` + port);
  });