export class RealtimeOpenAIService {
	constructor(apiKey) {
	  this.apiKey = apiKey;
	  this.pc = null;
	  this.dc = null;
	  this.isConnected = false;
	  this.audioContext = null;
	  this.analyser = null;
	  this.onLipSyncData = null;
	  this.onTranscript = null;
	  this.isAnalyzing = false;
	  this.currentLipSyncData = { A: 0, E: 0, I: 0, O: 0, U: 0 };
	  
	  this.initializeAudio();
	}
  
	async initializeAudio() {
	  try {
		this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		this.analyser = this.audioContext.createAnalyser();
		this.analyser.fftSize = 512;
		this.analyser.smoothingTimeConstant = 0.3;
	  } catch (error) {
		console.error('Failed to initialize audio context:', error);
	  }
	}
  
	async connect() {
	  try {
		console.log('🔗 Connecting to OpenAI Realtime API...');
		
		// Create RTCPeerConnection
		this.pc = new RTCPeerConnection({
		  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
		});
		
		// Set up audio
		await this.setupAudio();
		
		// Set up data channel
		this.setupDataChannel();
		
		// Create connection
		await this.establishConnection();
		
		console.log('✅ Connected to OpenAI Realtime API');
		this.isConnected = true;
		
	  } catch (error) {
		console.error('❌ Failed to connect to OpenAI:', error);
		throw error;
	  }
	}
  
	async setupAudio() {
	  try {
		// Get microphone
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const [track] = stream.getAudioTracks();
		
		// Add to peer connection
		this.pc.addTrack(track, stream);
		
		// Handle incoming audio from OpenAI
		this.pc.ontrack = (event) => {
		  console.log('🎵 Received audio track from OpenAI');
		  const [remoteStream] = event.streams;
		  this.handleOpenAIAudio(remoteStream);
		};
		
	  } catch (error) {
		console.error('Failed to setup audio:', error);
		throw error;
	  }
	}
  
	handleOpenAIAudio(stream) {
	  console.log('🎧 Processing OpenAI audio stream for lip sync');
	  
	  // Resume audio context if needed
	  if (this.audioContext.state === 'suspended') {
		this.audioContext.resume();
	  }
	  
	  // Create audio element to play the sound
	  const audio = new Audio();
	  audio.srcObject = stream;
	  audio.autoplay = true;
	  audio.volume = 1.0;
	  
	  // Connect to analyser for lip sync
	  const source = this.audioContext.createMediaStreamSource(stream);
	  source.connect(this.analyser);
	  
	  // Start analyzing
	  this.startLipSyncAnalysis();
	  
	  // Stop analyzing when track ends
	  stream.getAudioTracks()[0].addEventListener('ended', () => {
		console.log('🔇 OpenAI audio ended');
		this.stopLipSyncAnalysis();
	  });
	}
  
	startLipSyncAnalysis() {
	  if (this.isAnalyzing) return;
	  
	  this.isAnalyzing = true;
	  console.log('🎭 Starting lip sync analysis...');
	  
	  const analyze = () => {
		if (!this.isAnalyzing) return;
		
		const bufferLength = this.analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		this.analyser.getByteFrequencyData(dataArray);
		
		// Calculate overall volume
		const volume = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
		
		if (volume > 0.01) {
		  // Generate lip sync data from frequency analysis
		  const lipSyncData = this.generateLipSyncFromAudio(dataArray, volume);
		  
		  // Smooth the data
		  this.currentLipSyncData = this.smoothLipSyncData(this.currentLipSyncData, lipSyncData);
		  
		  if (this.onLipSyncData) {
			this.onLipSyncData(this.currentLipSyncData);
		  }
		} else {
		  // Fade to neutral when no audio
		  this.currentLipSyncData = this.smoothLipSyncData(this.currentLipSyncData, {
			A: 0, E: 0, I: 0, O: 0, U: 0
		  });
		  
		  if (this.onLipSyncData) {
			this.onLipSyncData(this.currentLipSyncData);
		  }
		}
		
		requestAnimationFrame(analyze);
	  };
	  
	  analyze();
	}
  
	generateLipSyncFromAudio(frequencyData, volume) {
	  // Analyze different frequency bands for vowel characteristics
	  const lowBass = this.getFrequencyAverage(frequencyData, 0, 10);      // 0-430Hz
	  const bass = this.getFrequencyAverage(frequencyData, 10, 25);        // 430-1075Hz  
	  const midLow = this.getFrequencyAverage(frequencyData, 25, 50);      // 1075-2150Hz
	  const midHigh = this.getFrequencyAverage(frequencyData, 50, 100);    // 2150-4300Hz
	  const treble = this.getFrequencyAverage(frequencyData, 100, 150);    // 4300-6450Hz
	  
	  // Enhanced volume scaling
	  const volumeBoost = Math.min(1, volume * 3);
	  
	  // Map frequency content to vowel shapes based on formant frequencies
	  return {
		A: Math.max(0, Math.min(1, (lowBass * 1.5 + bass * 1.2) * volumeBoost)),        // Low formants
		E: Math.max(0, Math.min(1, (bass * 0.8 + midHigh * 1.4) * volumeBoost)),        // Mixed formants
		I: Math.max(0, Math.min(1, (midLow * 0.6 + treble * 1.6) * volumeBoost)),       // High formants
		O: Math.max(0, Math.min(1, (lowBass * 1.3 + bass * 1.1) * volumeBoost)),        // Low-mid formants
		U: Math.max(0, Math.min(1, (lowBass * 1.4 + midLow * 0.8) * volumeBoost))       // Very low formants
	  };
	}
  
	getFrequencyAverage(dataArray, startIndex, endIndex) {
	  let sum = 0;
	  const actualEnd = Math.min(endIndex, dataArray.length);
	  const count = actualEnd - startIndex;
	  
	  for (let i = startIndex; i < actualEnd; i++) {
		sum += dataArray[i];
	  }
	  
	  return count > 0 ? (sum / count) / 255 : 0;
	}
  
	smoothLipSyncData(current, target, smoothing = 0.5) {
	  return {
		A: current.A + (target.A - current.A) * smoothing,
		E: current.E + (target.E - current.E) * smoothing,
		I: current.I + (target.I - current.I) * smoothing,
		O: current.O + (target.O - current.O) * smoothing,
		U: current.U + (target.U - current.U) * smoothing
	  };
	}
  
	stopLipSyncAnalysis() {
	  this.isAnalyzing = false;
	  console.log('🛑 Stopping lip sync analysis');
	  
	  // Fade to neutral
	  const fadeSteps = 20;
	  let step = 0;
	  
	  const fade = () => {
		step++;
		const progress = step / fadeSteps;
		
		this.currentLipSyncData = {
		  A: this.currentLipSyncData.A * (1 - progress),
		  E: this.currentLipSyncData.E * (1 - progress),
		  I: this.currentLipSyncData.I * (1 - progress),
		  O: this.currentLipSyncData.O * (1 - progress),
		  U: this.currentLipSyncData.U * (1 - progress)
		};
		
		if (this.onLipSyncData) {
		  this.onLipSyncData(this.currentLipSyncData);
		}
		
		if (step < fadeSteps) {
		  setTimeout(fade, 50);
		}
	  };
	  
	  fade();
	}
  
	setupDataChannel() {
	  this.dc = this.pc.createDataChannel('oai-events');
	  
	  this.dc.addEventListener('open', () => {
		console.log('📡 Data channel opened');
		this.sendSessionUpdate();
	  });
	  
	  this.dc.addEventListener('message', (event) => {
		const message = JSON.parse(event.data);
		this.handleMessage(message);
	  });
	}
  
	async establishConnection() {
	  // Create offer
	  await this.pc.setLocalDescription();
	  
	  // Send to OpenAI
	  const response = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
		method: 'POST',
		body: this.pc.localDescription.sdp,
		headers: {
		  'Authorization': `Bearer ${this.apiKey}`,
		  'Content-Type': 'application/sdp'
		}
	  });
  
	  if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	  }
  
	  // Set remote description
	  const answerSdp = await response.text();
	  await this.pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
	  
	  // Wait for connection
	  await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error('Connection timeout')), 15000);
		
		this.pc.addEventListener('connectionstatechange', () => {
		  console.log('🔗 Connection state:', this.pc.connectionState);
		  
		  if (this.pc.connectionState === 'connected') {
			clearTimeout(timeout);
			resolve();
		  } else if (this.pc.connectionState === 'failed') {
			clearTimeout(timeout);
			reject(new Error('Connection failed'));
		  }
		});
	  });
	}
  
	sendSessionUpdate() {
	  if (this.dc?.readyState === 'open') {
		const message = {
		  type: 'session.update',
		  session: {
			modalities: ['text', 'audio'],
			instructions: `# Socratic Learning AI Teaching Agent System Prompt

## Core Identity

You are an enthusiastic, patient, and adaptive Socratic teaching agent designed for students in Qatar. Your primary mission is to facilitate deep understanding through guided discovery, step-by-step learning, and continuous assessment. You excel at breaking down complex concepts into digestible parts and ensuring mastery before progression.

## Interaction Protocols

### Initial Greeting Behavior

- *ALWAYS* begin each new session with high enthusiasm and warmth
- Greet the student and immediately ask: "What would you like to learn today?"
- Before proceeding with any topic, ask: "Would you prefer to learn in English or Arabic today?" and adapt accordingly
- Access and reference the student's learning history to personalize the experience
- Show genuine excitement about their learning journey

### Communication Style

- *Voice-based interaction awareness*: Keep responses conversational and natural for spoken delivery
- Use warm, encouraging, and patient tone throughout
- Avoid overly complex sentence structures that are difficult to follow in speech
- Include natural pauses and emphasis markers when needed

## Socratic Learning Methodology

### Step-by-Step Framework

1. *Concept Introduction*: Present the main topic with a relatable, engaging hook
2. *Guided Discovery*: Use questions to help students discover knowledge themselves
3. *Incremental Building*: Break every concept into logical, sequential micro-steps
4. *Continuous Assessment*: After EACH step, pause and assess understanding
5. *Adaptive Response*: Adjust approach based on student feedback and comprehension

### Assessment After Every Step

After explaining each concept component, ALWAYS:

- Ask specific questions to gauge understanding: "Can you explain this part back to me?" or "What do you think would happen if…?"
- Listen carefully to their response to assess comprehension level
- Provide immediate, constructive feedback
- Only proceed to the next step when confident of understanding

### Adaptive Teaching Strategies

When a student shows uncertainty or confusion:

- *Strategy 1*: Use analogies and real-world examples relevant to their context
- *Strategy 2*: Break the concept into even smaller sub-steps
- *Strategy 3*: Employ different learning modalities (visual descriptions, kinesthetic analogies)
- *Strategy 4*: Connect to previously mastered concepts
- *Strategy 5*: Use questioning to guide them to the answer rather than providing it directly

## Interactive Engagement Techniques

### Maintaining Active Participation

- Ask open-ended questions frequently
- Encourage the student to make predictions and hypotheses
- Use "What if…" scenarios to stimulate critical thinking
- Request examples from the student's own experience
- Celebrate insights and correct reasoning enthusiastically

### Socratic Questioning Framework

- *Clarification*: "What do you mean when you say…?"
- *Evidence*: "What evidence supports this?"
- *Perspective*: "How might someone who disagrees respond?"
- *Implications*: "What does this tell us about…?"
- *Meta-questions*: "Why do you think this question is important?"

## Language Support Guidelines

### Bilingual Capabilities

- Seamlessly switch between English and Arabic as requested
- Maintain the same enthusiastic, Socratic approach in both languages
- Use culturally appropriate examples and contexts for Qatar-based students
- Offer to explain concepts in the other language if understanding seems challenging

### Cultural Sensitivity

- Incorporate examples relevant to Middle Eastern and Qatari context when appropriate
- Respect cultural values while maintaining scientific accuracy
- Use familiar analogies from the student's cultural background

## Learning Verification Process

### Understanding Checkpoints

Before moving to new concepts:

1. *Explain-back Test*: "Can you teach this concept to an imaginary friend?"
2. *Application Check*: "How would you use this in a real situation?"
3. *Connection Assessment*: "How does this relate to what we learned earlier?"
4. *Confidence Check*: "On a scale of 1-10, how confident do you feel about this?"

### Mastery Indicators

- Student can explain the concept in their own words
- Student can provide original examples
- Student can make connections to related concepts
- Student demonstrates confidence in their understanding

## Adaptive Response Patterns

### If Student Understands Quickly

- Provide enrichment through deeper questions
- Introduce related advanced concepts
- Encourage them to find patterns and make predictions

### If Student Struggles

- Slow down and break concepts into smaller pieces
- Use more concrete, familiar examples
- Ask leading questions to guide discovery
- Provide encouragement and normalize the learning process
- Try alternative explanation methods

### If Student Loses Interest

- Reconnect to their initial curiosity
- Find personal relevance and applications
- Use more interactive, question-based approach
- Celebrate small wins to rebuild confidence

## Session Management

### Continuous Learning Thread

- Build upon previous sessions naturally
- Reference past learning to show progress
- Connect new concepts to previously mastered material
- Maintain a sense of learning journey and achievement

### Pacing Control

- Let the student's understanding pace dictate speed
- Never rush to cover material at the expense of comprehension
- Ensure solid foundation before building complexity
- Regularly check if they need breaks or want to review

## Success Metrics

Your success is measured by:

- Student's deep understanding of concepts (not just memorization)
- Student's ability to apply knowledge to new situations
- Student's increased confidence and curiosity
- Student's active engagement throughout the session
- Student's demonstrated mastery before topic progression

## Remember

You are not just delivering information—you are facilitating discovery, building understanding, and nurturing intellectual curiosity through the time-tested Socratic method. Every interaction should leave the student more confident, curious, and knowledgeable than when they started.`,
			voice: 'alloy',
			input_audio_format: 'pcm16',
			output_audio_format: 'pcm16',
			input_audio_transcription: { model: 'whisper-1' },
			turn_detection: {
			  type: 'server_vad',
			  threshold: 0.5,
			  prefix_padding_ms: 300,
			  silence_duration_ms: 500
			}
		  }
		};
		
		this.dc.send(JSON.stringify(message));
		console.log('⚙️ Session configured with Socratic Learning instructions');
	  }
	}
  
	handleMessage(message) {
	  switch (message.type) {
		case 'session.created':
		  console.log('✅ Session created');
		  break;
		case 'session.updated':
		  console.log('⚙️ Session updated');
		  break;
		case 'response.audio_transcript.delta':
		  if (this.onTranscript) {
			this.onTranscript(message.delta);
		  }
		  break;
		case 'response.audio_transcript.done':
		  console.log('📝 Transcript complete');
		  break;
		case 'response.delta':
		  // Handle streaming text responses
		  if (message.delta?.text && this.onTranscript) {
			this.onTranscript(message.delta.text);
		  }
		  break;
		case 'response.done':
		  console.log('✅ Response complete');
		  break;
		case 'error':
		  console.error('❌ OpenAI error:', message.error);
		  break;
		default:
		  console.log('📨 Received message:', message.type);
	  }
	}
  
	sendTestMessage() {
	  if (this.dc?.readyState === 'open') {
		const message = {
		  type: 'response.create',
		  response: {
			modalities: ['text', 'audio']
		  }
		};
		
		this.dc.send(JSON.stringify(message));
		console.log('🗣️ Requesting AI to start Socratic learning session...');
	  } else {
		console.error('❌ Data channel not ready');
	  }
	}

	sendUserMessage(text) {
	  if (this.dc?.readyState === 'open') {
		const message = {
		  type: 'response.create',
		  response: {
			modalities: ['text', 'audio'],
			text: text
		  }
		};
		
		this.dc.send(JSON.stringify(message));
		console.log('💬 Sending user message:', text);
	  } else {
		console.error('❌ Data channel not ready');
	  }
	}
  
	disconnect() {
	  this.isConnected = false;
	  this.stopLipSyncAnalysis();
	  
	  if (this.pc) {
		this.pc.close();
		this.pc = null;
	  }
	  
	  if (this.dc) {
		this.dc = null;
	  }
	}
  } 