// require('dotenv').config();
// const express = require('express')
// const app = express();
// const cors = require('cors');
// const connection = require("./db");
// const userRoutes = require("./routes/users");
// const authRoutes = require("./routes/auth");
// const otpRoutes = require("./routes/otp");


// // database connection
// connection();

// // middilwares
// app.use(express.json())
// app.use(cors());

// // routes
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);


// // Add OTP Routes
// app.use("/api", otpRoutes);

// const port = process.env.PORT || 8080;
// app.listen(port, ()=> console.log(`Listing port is ${port}...`))

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const axios = require('axios');
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const otpRoutes = require("./routes/otp");

// database connection
connection();

// Enhanced CORS configuration
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// middlewares
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", otpRoutes);

// Enhanced cache with TTL
const predictionCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

// Middleware for cleaning cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of predictionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      predictionCache.delete(key);
    }
  }
}, 600000); // Clean every 10 minutes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date(),
    cacheSize: predictionCache.size,
    memoryUsage: process.memoryUsage()
  });
});

// Protein structure prediction endpoint
app.post('/api/predict', async (req, res) => {
  try {
    const { sequence } = req.body;
    
    // Validate input
    if (!sequence || typeof sequence !== 'string') {
      return res.status(400).json({ error: 'Sequence is required and must be a string' });
    }
    
    if (sequence.length < 10) {
      return res.status(400).json({ 
        error: 'Sequence too short',
        details: 'Minimum 10 amino acids required'
      });
    }
    
    if (sequence.length > 1000) {
      return res.status(400).json({ 
        error: 'Sequence too long',
        details: 'Maximum 1000 amino acids allowed'
      });
    }

    // Check cache
    const cached = predictionCache.get(sequence);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      return res.json(cached.data);
    }

    // Try ESMFold API with enhanced timeout and retry
    let pdbData;
    let source = 'esmfold';
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios.post(
          'https://api.esmatlas.com/foldSequence/v1/pdb/',
          sequence,
          {
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept-Encoding': 'gzip, deflate, br'
            },
            timeout: 120000,
            maxContentLength: 10000000,
            maxBodyLength: 10000000
          }
        );
        pdbData = response.data;
        break;
      } catch (esmError) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.warn('ESMFold API failed, using fallback');
          pdbData = generateEnhancedPDB(sequence);
          source = 'fallback';
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    const plDDT = calculatePLDDT(pdbData);
    const secondaryStructure = predictSecondaryStructure(pdbData);
    
    const result = { 
      pdb: pdbData, 
      plDDT, 
      secondaryStructure,
      source,
      timestamp: new Date().toISOString()
    };
    
    // Cache result with timestamp
    predictionCache.set(sequence, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Prediction failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      suggestion: 'Please try again with a different sequence'
    });
  }
});

// Helper functions
function calculatePLDDT(pdbData) {
  try {
    if (!pdbData || typeof pdbData !== 'string') return 0;
    
    const lines = pdbData.split('\n');
    let sum = 0;
    let count = 0;
    
    lines.forEach(line => {
      if (line.startsWith('ATOM')) {
        const bFactor = parseFloat(line.substring(60, 66).trim());
        if (!isNaN(bFactor)) {
          sum += bFactor;
          count++;
        }
      }
    });
    
    return count > 0 ? (sum / count).toFixed(2) : 0;
  } catch (err) {
    console.error('Error calculating plDDT:', err);
    return 0;
  }
}

function predictSecondaryStructure(pdbData) {
  try {
    const lines = pdbData.split('\n');
    const structure = [];
    const caAtoms = [];
    
    // Collect CA atoms
    lines.forEach(line => {
      if (line.startsWith('ATOM') && line.substring(12, 16).trim() === 'CA') {
        caAtoms.push({
          x: parseFloat(line.substring(30, 38).trim()),
          y: parseFloat(line.substring(38, 46).trim()),
          z: parseFloat(line.substring(46, 54).trim()),
          resNum: parseInt(line.substring(22, 26).trim()),
          bFactor: parseFloat(line.substring(60, 66).trim())
        });
      }
    });

    // Predict secondary structure
    for (let i = 0; i < caAtoms.length; i++) {
      const current = caAtoms[i];
      const prev = i > 0 ? caAtoms[i-1] : null;
      const next = i < caAtoms.length - 1 ? caAtoms[i+1] : null;
      
      let ssType = 'C'; // Default to coil
      
      if (prev && next) {
        const angle = calculateAngle(prev, current, next);
        if (angle > 70 && angle < 120) ssType = 'H'; // Helix
        else if (angle > 120 && angle < 180) ssType = 'E'; // Sheet
      }
      
      structure.push({
        resNum: current.resNum,
        ssType
      });
    }
    
    return structure;
  } catch (err) {
    console.error('Error predicting secondary structure:', err);
    return null;
  }
}

function calculateAngle(a, b, c) {
  const ba = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const bc = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  
  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const magA = Math.sqrt(ba.x * ba.x + ba.y * ba.y + ba.z * ba.z);
  const magB = Math.sqrt(bc.x * bc.x + bc.y * bc.y + bc.z * bc.z);
  
  return Math.acos(dot / (magA * magB)) * (180 / Math.PI);
}

function generateEnhancedPDB(sequence) {
  let pdb = 'HEADER    GENERATED PROTEIN STRUCTURE\n';
  let atomNum = 1;
  let residueNum = 1;
  
  sequence.split('').forEach((aa, idx) => {
    const x = idx * 1.5;
    const y = Math.sin(idx * 0.5) * 5;
    const z = Math.cos(idx * 0.5) * 5;
    
    pdb += `ATOM  ${atomNum.toString().padStart(5, ' ')}  N   ${aa} A${residueNum.toString().padStart(4, ' ')}    ${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}  1.00 70.00           N\n`;
    atomNum++;
    pdb += `ATOM  ${atomNum.toString().padStart(5, ' ')}  CA  ${aa} A${residueNum.toString().padStart(4, ' ')}    ${(x+1.0).toFixed(3)} ${(y+0.5).toFixed(3)} ${(z+0.5).toFixed(3)}  1.00 70.00           C\n`;
    atomNum++;
    residueNum++;
  });
  
  pdb += 'TER\nEND\n';
  return pdb;
}

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

// Enhanced server event handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});