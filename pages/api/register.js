
export default function handler(req, res) {
  if (req.method === 'POST') {

    let body = '';
    // req.on('data', (chunk) => {
    //   body += chunk.toString();
    // });

    console.log(body);

  } else {
    res.status(405).end(); // Method Not Allowed
  }
}