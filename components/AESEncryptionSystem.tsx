"use client";

import React, { useState, useEffect } from "react";
import AES from "../lib/aes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AESEncryptionSystem: React.FC = () => {
  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt">("encrypt");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  const hexStringToByteArray = (hexString: string): number[] => {
    const byteArray: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substr(i, 2), 16));
    }
    return byteArray;
  };

  const byteArrayToHexString = (byteArray: number[]): string => {
    return byteArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const handleEncrypt = () => {
    try {
      const plaintextBytes = hexStringToByteArray(plaintext);
      const keyBytes = hexStringToByteArray(key);

      if (keyBytes.length !== 16) {
        throw new Error("Key must be 128 bits (16 bytes) long");
      }

      const aes = new AES(keyBytes);
      const { cipherText, steps } = aes.encrypt(plaintextBytes);

      setCiphertext(byteArrayToHexString(cipherText));
      setSteps(steps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Encryption error:", error);
      if (error instanceof Error) {
        alert(`Error during encryption: ${error.message}`);
      } else {
        alert("An unknown error occurred during encryption.");
      }
    }
  };

  const handleDecrypt = () => {
    try {
      const ciphertextBytes = hexStringToByteArray(ciphertext);
      const keyBytes = hexStringToByteArray(key);

      if (keyBytes.length !== 16) {
        throw new Error("Key must be 128 bits (16 bytes) long");
      }

      const aes = new AES(keyBytes);
      const { plainText, steps } = aes.decrypt(ciphertextBytes);

      setDecryptedText(byteArrayToHexString(plainText));
      setSteps(steps);
      setCurrentStep(0);
    } catch (error) {
      console.error("Decryption error:", error);
      if (error instanceof Error) {
        alert(`Error during decryption: ${error.message}`);
      } else {
        alert("An unknown error occurred during decryption.");
      }
    }
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSteps = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, playbackSpeed);
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const matrixAnimation = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.5 } },
  };

  return (
    <div className="container mx-auto p-4 bg-gradient-to-br from-purple-100 to-indigo-200 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-800">
        AES Encryption System
      </h1>
      <Tabs
        defaultValue="encrypt"
        onValueChange={(value) => {
          setActiveTab(value as "encrypt" | "decrypt");
          setSteps([]);
          setCurrentStep(0);
          setIsPlaying(false);
        }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="encrypt" className="text-lg">
            Encrypt
          </TabsTrigger>
          <TabsTrigger value="decrypt" className="text-lg">
            Decrypt
          </TabsTrigger>
        </TabsList>
        <TabsContent value="encrypt">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700">
                Encryption
              </CardTitle>
              <CardDescription>
                Enter plaintext and key to encrypt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="plaintext"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Plaintext (hex):
                  </label>
                  <Input
                    id="plaintext"
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Enter plaintext in hexadecimal"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="key"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Key (hex):
                  </label>
                  <Input
                    id="key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter 128-bit key in hexadecimal"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleEncrypt}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Encrypt
                </Button>
                <div>
                  <label
                    htmlFor="ciphertext"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ciphertext (hex):
                  </label>
                  <Input
                    id="ciphertext"
                    value={ciphertext}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="decrypt">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-indigo-700">
                Decryption
              </CardTitle>
              <CardDescription>
                Enter ciphertext and key to decrypt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="ciphertext-input"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ciphertext (hex):
                  </label>
                  <Input
                    id="ciphertext-input"
                    value={ciphertext}
                    onChange={(e) => setCiphertext(e.target.value)}
                    placeholder="Enter ciphertext in hexadecimal"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="key-decrypt"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Key (hex):
                  </label>
                  <Input
                    id="key-decrypt"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter 128-bit key in hexadecimal"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleDecrypt}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Decrypt
                </Button>
                <div>
                  <label
                    htmlFor="decrypted-text"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Decrypted Text (hex):
                  </label>
                  <Input
                    id="decrypted-text"
                    value={decryptedText}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {steps.length > 0 && (
        <Card className="mt-8 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-700">
              {activeTab === "encrypt" ? "Encryption" : "Decryption"} Steps
            </CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={matrixAnimation}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg shadow-inner"
                >
                  <pre className="whitespace-pre-wrap font-mono text-sm text-indigo-800">
                    {steps[currentStep]}
                  </pre>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between items-center">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <div className="flex space-x-2">
                  <Button onClick={togglePlayback} variant="outline">
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button onClick={resetSteps} variant="outline">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleNextStep}
                  disabled={currentStep === steps.length - 1}
                  variant="outline"
                >
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center items-center space-x-2">
                <span className="text-sm text-gray-600">Playback Speed:</span>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-48"
                />
                <span className="text-sm text-gray-600">{playbackSpeed}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AESEncryptionSystem;
