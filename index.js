const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// for the purpous of the assignment i'm saving the data locally in the server, 
// but for a real life application with large sets of data I would save it in a database and write the backend accordingly.
const publishers = [
  {
    publisher: "publisher 1",
    domains: [
      {
        id: 1,
        domain: "bla.com",
        desktopAds: 5,
        mobileAds: 3,
      },
      {
        id: 2,
        domain: "bla1.com",
        desktopAds: 2,
        mobileAds: 30,
      },
    ],
  },
  {
    publisher: "publisher 2",
    domains: [
      {
        id: 4,
        domain: "gar.com",
        desktopAds: 0,
        mobileAds: 4,
      },
      {
        id: 5,
        domain: "gar.com",
        desktopAds: 5,
        mobileAds: 3,
      },
    ],
  },
];

let maxID = 1;
publishers.forEach((pub) => {
  maxID += pub.domains.length;
});

///// Publishers
// get all publishers
app.get("/api/publishers", (req, res) => {
  res.json(publishers);
});

// create a new publisher
app.post("/api/add-publisher", (req, res) => {
  const { publisherName } = req.body;

  if (publishers.find((pub) => pub.publisher === publisherName)) {
    return res.status(409).json({ error: "Publisher already exists." });
  } else {
    publishers.push({ publisher: publisherName, domains: [] });
    return res
      .status(201)
      .json({ message: "Publisher main added successfully", publishers });
  }
});

///// Domains
// get a list of all domains
app.get("/api/domains", (req, res) => {
  const allDomains = [];
  publishers.forEach((publisher) =>
    publisher.domains.forEach((domain) => allDomains.push(domain.domain))
  );

  res.send(allDomains);
});

// create a new domain
app.post("/api/add-domain", (req, res) => {
  const { publisherName, domainName, desktopAds, mobileAds } = req.body;

  if (!publisherName || !domainName) {
    return res.status(400).json({
      error: "publisherName and newDomain (with domain) are required",
    });
  }

  const publisher = publishers.find((pub) => pub.publisher === publisherName);

  if (!publisher) {
    return res.status(404).json({ error: "Publisher not found" });
  }

  // Check if the domain already exists in other publishers
  const domainExists = publishers.find(
    (pub) =>
      pub.publisher !== publisherName &&
      pub.domains.some((domain) => domain.domain === domainName)
  );

  if (domainExists) {
    return res
      .status(409)
      .json({ error: "Domain already exists in another publisher" });
  }

  // Add the new domain to the publisher's domains array
  publisher.domains.push({
    id: maxID,
    domain: domainName,
    desktopAds,
    mobileAds,
  });
  maxID += 1;

  return res
    .status(201)
    .json({ message: "Domain added successfully", publishers });
});

// delete a specific domain
app.delete("/api/delete-domain/", (req, res) => {
  const { publisher, domainID } = req.body;

  const publisherIndex = publishers.findIndex(
    (pub) => pub.publisher === publisher
  );

  if (publisherIndex === -1) {
    return res.status(404).json({ message: "Publisher not found" });
  }

  const domainIndex = publishers[publisherIndex].domains.findIndex(
    (dom) => dom.id === +domainID
  );
  if (domainIndex === -1) {
    return res.status(404).json({ message: "Domain not found" });
  }

  // Remove the domain
  publishers[publisherIndex].domains.splice(domainIndex, 1);
  return res.status(200).json({ message: "Domain deleted successfully" });
});

// update a specific domain
app.put("/api/delete-domain/:domainID", (req, res) => {
  const { domainID } = req.params;
});

// Start the server on port 3213
const PORT = 3213;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
