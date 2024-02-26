import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	}
}>();


//all the things you need to is already presentin c(contect)
app.post('/api/v1/signup', async (c) => {
  // @ts-ignore you can also use this it will ignore the next line
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	try {
		const user = await prisma.user.create({
			data: {
				email: body.email,
				password: body.password
			}
		});
		const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
		return c.json({ jwt });
	} catch(e) {
		c.status(403);
		return c.json({ error: "error while signing up" });
	}
})


app.post("/api/v1/signin",async (c)=>{
  const prisma = new PrismaClient({
    // @ts-ignore you can also use this it will ignore the next line
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body =await c.req.json();
  const user=await  prisma.user.findUnique({
    where:{
      email:body.email,
    }
  });  
  if(!user) {
    c.status(403);
    return c.json({error:"user not found"});
  }
  const jwt=await sign({id:user.id},c.env.JWT_SECRET);
  return c.json({token:jwt});
})


app.post("/api/v1/blog",(c)=>{
  return c.text('blog  route');
})
app.put("/api/v1/blog",(c)=>{
  return c.text('blog route');
})
app.get("/api/v1/blog/:id",(c)=>{
  return c.text('blog route');
})

export default app
