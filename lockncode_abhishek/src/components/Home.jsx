"use client"

import { useState, useEffect, Suspense } from "react"
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Shield,
  Mail,
  Globe,
  MessageSquare,
  BarChart3,
  Code,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 3D Shield Model
function ShieldModel(props) {
  return (
    <Float rotationIntensity={0.2} floatIntensity={0.5} speed={1.5}>
      <Center>
        <mesh {...props} castShadow receiveShadow>
          <boxGeometry args={[2, 2.5, 0.2]} />
          <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
          <Text3D
            font="/fonts/inter_bold.json"
            position={[-0.65, -0.2, 0.15]}
            size={0.4}
            height={0.1}
            curveSegments={12}
          >
            AI
            <meshStandardMaterial color="#ffffff" />
          </Text3D>
        </mesh>
      </Center>
    </Float>
  )
}

// 3D Threat Model
function ThreatModel(props) {
  return (
    <Float rotationIntensity={0.3} floatIntensity={0.5} speed={2}>
      <group {...props}>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#ef4444" metalness={0.5} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[0.8, 0.1, 16, 100]} />
          <meshStandardMaterial
            color="#ef4444"
            metalness={0.5}
            roughness={0.2}
            emissive="#ef4444"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </Float>
  )
}

function Scene() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Suspense fallback={null}>
        <ShieldModel position={[-1.5, 0, 0]} />
        <ThreatModel position={[1.5, 0, 0]} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}

// Feature Card Component
function FeatureCard({ icon: Icon, title, description, iconColor = "text-primary", bgColor = "bg-primary/10" }) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-muted hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/5">
      <CardHeader>
        <div className={`${bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
          <Icon className={`${iconColor} h-6 w-6`} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

// Stat Card Component
const StatCard = ({ value, label, icon: Icon, iconColor, bgColor }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-6 rounded-2xl shadow-lg ${bgColor} flex flex-col items-center text-center transition-all duration-300`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconColor} bg-opacity-20`}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-3xl font-bold text-white mt-4">{value}</h3>
      <p className="text-sm text-gray-300 mt-2">{label}</p>
    </motion.div>
  );
};

function Home() {
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    document.body.classList.add("dark")
    return () => {
      document.body.classList.remove("dark")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative pt-40 pb-5 md:pb-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-500"
            >
              AI-Powered Phishing Detection
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-3xl text-muted-foreground mb-8"
            >
              Protect your organization with advanced machine learning that detects phishing attempts in emails,
              websites, and messages in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="md:gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
              >
                Try Demo <ChevronRight className="h-4 w-full md:w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>
      {/* <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0 h-full w-full">
        <div className="h-full w-full">
          <Scene />
        </div>
      </motion.div> */}
      {/* Stats Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-center text-white mb-10">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
              value="98.18%"
              label="Detection Accuracy"
              icon={CheckCircle}
              iconColor="text-emerald-400"
              bgColor="bg-emerald-500/20"
            />
            <StatCard
              value="<100ms"
              label="Response Time"
              icon={AlertTriangle}
              iconColor="text-amber-400"
              bgColor="bg-amber-500/20"
            />
            <StatCard
              value="24/7"
              label="Real-time Protection"
              icon={Shield}
              iconColor="text-blue-400"
              bgColor="bg-blue-500/20"
            />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Protection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system analyzes multiple layers of content to detect even the most sophisticated phishing
              attempts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Mail}
                iconColor="text-cyan-400"
                bgColor="bg-cyan-500/10"
                title="Email Analysis"
                description="Detect phishing in emails by analyzing headers, content patterns, sender reputation, and embedded links using advanced NLP techniques."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={Globe}
                iconColor="text-purple-400"
                bgColor="bg-purple-500/10"
                title="Website Scanning"
                description="Identify malicious websites through URL structure analysis, domain reputation checks, and visual similarity to legitimate sites."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={MessageSquare}
                iconColor="text-blue-400"
                bgColor="bg-blue-500/10"
                title="Message Protection"
                description="Analyze SMS and messaging platforms for phishing attempts using contextual analysis and behavioral patterns."
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 md:py-24 bg-gradient-to-r from-slate-900/80 to-indigo-950/50 relative"
      >
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our multi-layered approach ensures comprehensive protection against evolving phishing threats.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="detect" className="w-full">
              <TabsList className="grid w-full grid-cols-3 gap-4 p-1 bg-slate-800/50 backdrop-blur-sm">
                <TabsTrigger
                  value="detect"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  Detect
                </TabsTrigger>
                <TabsTrigger
                  value="analyze"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  Analyze
                </TabsTrigger>
                <TabsTrigger
                  value="learn"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
                >
                  Learn
                </TabsTrigger>
              </TabsList>
              <TabsContent value="detect" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Detection</CardTitle>
                    <CardDescription>
                      Our system scans incoming communications in real-time to identify potential threats.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Content Scanning</h4>
                        <p className="text-muted-foreground">
                          Analyzes email content, URLs, and message text for suspicious patterns
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Metadata Examination</h4>
                        <p className="text-muted-foreground">
                          Evaluates headers, sender information, and technical details
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Threat Scoring</h4>
                        <p className="text-muted-foreground">Assigns a risk score based on multiple indicators</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="analyze" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deep Analysis</CardTitle>
                    <CardDescription>
                      Our AI performs comprehensive analysis of potential threats using multiple techniques.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">NLP Processing</h4>
                        <p className="text-muted-foreground">
                          Analyzes text for linguistic patterns common in phishing attempts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">URL & Domain Analysis</h4>
                        <p className="text-muted-foreground">Checks reputation databases and analyzes URL structure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Visual Similarity Detection</h4>
                        <p className="text-muted-foreground">
                          Identifies websites designed to mimic legitimate services
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="learn" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Continuous Learning</CardTitle>
                    <CardDescription>
                      Our system evolves to stay ahead of emerging threats and attack patterns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Feedback Integration</h4>
                        <p className="text-muted-foreground">
                          Incorporates user feedback to improve detection accuracy
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Automated Retraining</h4>
                        <p className="text-muted-foreground">Regularly updates models with new threat data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Threat Intelligence</h4>
                        <p className="text-muted-foreground">Integrates with global threat databases to stay current</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Dashboard</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitor threats, visualize attack patterns, and customize detection thresholds with our intuitive
              dashboard.
            </p>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-muted shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-blue-600/20 z-0"></div>
            <div className="relative z-10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-background/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">247</div>
                    <p className="text-xs text-muted-foreground">+12% from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">99.8%</div>
                    <p className="text-xs text-muted-foreground">+0.5% from last week</p>
                  </CardContent>
                </Card>
                <Card className="bg-background/80 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">False Positives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">0.2%</div>
                    <p className="text-xs text-muted-foreground">-0.1% from last week</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Threat Activity</CardTitle>
                    <CardDescription>Phishing attempts over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                      <BarChart3 className="h-full w-full text-muted-foreground/20" />
                      <div className="absolute text-sm text-muted-foreground">Interactive chart visualization</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Threat Types</CardTitle>
                    <CardDescription>Distribution by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Email Phishing</span>
                          <span className="text-sm font-medium">64%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full h-2"
                            style={{ width: "64%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Website Spoofing</span>
                          <span className="text-sm font-medium">28%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full h-2"
                            style={{ width: "28%" }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">SMS Phishing</span>
                          <span className="text-sm font-medium">8%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full h-2"
                            style={{ width: "8%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-indigo-950/70 relative">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=20&width=20')] bg-[size:20px_20px] opacity-5 pointer-events-none"></div>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">API Integration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Seamlessly integrate our phishing detection capabilities into your existing security infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Simple Integration</h3>
              <p className="text-muted-foreground mb-6">
                Our RESTful API makes it easy to add advanced phishing detection to your applications, email systems,
                and security tools.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">RESTful Endpoints</h4>
                    <p className="text-muted-foreground">
                      Simple HTTP requests for analyzing emails, URLs, and messages
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Secure Authentication</h4>
                    <p className="text-muted-foreground">API keys and OAuth2 support for secure integration</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Detailed Responses</h4>
                    <p className="text-muted-foreground">Comprehensive threat analysis with confidence scores</p>
                  </div>
                </div>
              </div>

              <Button className="mt-8">View API Documentation</Button>
            </div>

            <div>
              <Card className="bg-background/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Example API Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code className="text-foreground">
                      {`// Check a URL for phishing
fetch('https://api.PhishNet.ai/v1/analyze/url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    url: 'https://suspicious-website.com',
    checkVisualSimilarity: true,
    returnScreenshot: false
  })
})
.then(response => response.json())
.then(data => {
  console.log('Threat score:', data.threatScore);
  console.log('Is phishing:', data.isPhishing);
  console.log('Confidence:', data.confidence);
})`}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/20 rounded-xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-blue-500/10 z-0"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent_50%)] z-0"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure Your Organization?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start protecting your users from sophisticated phishing attacks with our AI-powered detection system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0"
                >
                  Get Started <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 py-12 border-t border-indigo-500/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">PhishNet AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Advanced AI-powered phishing detection to protect your organization from evolving threats.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Case Studies
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors duration-200"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-muted mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} PhishNet AI. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors duration-200">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors duration-200">
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home

