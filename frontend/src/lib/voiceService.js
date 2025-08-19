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
			instructions: 'You are a helpful assistant. Speak clearly and naturally.',
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
		console.log('⚙️ Session configured');
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
		case 'error':
		  console.error('❌ OpenAI error:', message.error);
		  break;
	  }
	}
  
	sendTestMessage() {
	  if (this.dc?.readyState === 'open') {
		const message = {
		  type: 'response.create',
		  response: {
			modalities: ['text', 'audio'],
			instructions: 'Say hello and introduce yourself as an AI assistant. Speak clearly with good pronunciation and natural intonation.'
		  }
		};
		
		this.dc.send(JSON.stringify(message));
		console.log('🗣️ Requesting OpenAI speech...');
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