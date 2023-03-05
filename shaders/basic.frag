#version 410 core

in vec3 fPosition;
in vec3 fNormal;
in vec2 fTexCoords;

out vec4 fColor;

//matrices
uniform mat4 model;
uniform mat4 view;
uniform mat3 normalMatrix;

//lighting
uniform vec3 lightDir; //lightDirection
uniform vec3 lightColor;

// textures
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

//components
vec3 ambient;
float ambientStrength = 0.2f;

vec3 diffuse;

vec3 specular;
float specularStrength = 0.7f;
float shininess= 32.0f;

//Lumina mea punctiforma: Felinarul de langa casa
uniform vec3 lightPositionFelinarC; //unde este pozitionata lumina
uniform vec3 lightColorFelinarC; 

//uniform vec3 lightPosFelinar;
//uniform vec3 lightColorFelinar;

//components 
//vec3 difuzaFelinar;
//vec3 specularFelinar;
//vec3 ambientFelinar;



vec3 ambientFelinarC;
vec3 specularFelinarC;
vec3 diffuseFelinarC;

//coeficienti atenuare
float constant=1.0f;
float linear = 0.7f;//1.0f;
float quadratic= 1.8f;//1.5f;

//UMBRE
in vec4 fragPosLightSpace;
uniform sampler2D shadowMap;


void computeDirLight()
{
    //compute eye space coordinates
    vec4 fPosEye = view * model * vec4(fPosition, 1.0f);
    vec3 normalEye = normalize(normalMatrix * fNormal);

    //normalize light direction
    vec3 lightDirN = vec3(normalize(view * vec4(lightDir, 0.0f)));

    //compute view direction (in eye coordinates, the viewer is situated at the origin
    vec3 viewDir = normalize(- fPosEye.xyz);

    //compute ambient light
    //ambient = ambientStrength * lightColor;
    ambient = 0.1 * lightColor;

    //compute diffuse light
    diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

    //compute specular light
    vec3 reflectDir = reflect(-lightDirN, normalEye);
    float specCoeff = pow(max(dot(viewDir, reflectDir), 0.0f), 32);
    specular = specularStrength * specCoeff * lightColor;
}


void computeDirLightFelinarC()
{
    //compute eye space coordinates
    vec4 fPosEyeF = view * model * vec4(fPosition, 1.0f);
    vec3 normalEyeF = normalize(normalMatrix * fNormal);
    
    //calcularea directiei luminii
    //diferenta dintre fPosEyeF si pozitia luminii din eye space

    //pozitia felinarului in eye space
    vec4 lightPosFelinarEye= view * model * vec4(lightPositionFelinarC, 1.0f);
    //normalize light direction
    vec3 lightDirNFel= vec3(normalize(vec3(lightPosFelinarEye) - fPosEyeF.xyz));
    
    //compute view direction (in eye coordinates, the viewer is situated at the origin
    vec3 viewDirFelinar = normalize(-fPosEyeF.xyz);

    //Atenuare
    //compute distance to light
    float dist= length(lightPosFelinarEye - fPosEyeF);

    float att= 1.0f / (constant + linear *dist + quadratic * (dist * dist));

    ambientFelinarC= att * ambientStrength * lightColorFelinarC;
    
    diffuseFelinarC= att*max(dot(normalEyeF, lightDirNFel), 0.0f) * lightColorFelinarC;

    vec3 reflectDirF = reflect(-lightDirNFel, normalEyeF);
    float specCoeffF = pow(max(dot(viewDirFelinar, reflectDirF), 0.0f), 32);
    specularFelinarC = att *specularStrength * specCoeffF * lightColorFelinarC;  


}
/*
void computeDirLightFelinar2()
{
   
     //eye spae coordinates pt obiecte raman aceleasi
    //compute eye space coordinates
    vec4 fPosEyeF = view * model * vec4(fPosition, 1.0f);
    vec3 normalEyeF = normalize(normalMatrix * fNormal);

    //compute light direction for felinar
     //duc coord felinarului in eye space
      vec4 lightPosEyeFelinar = view * model * vec4(lightPosFelinar, 1.0f);
      vec3 lightDirNFelinar = vec3(normalize(vec3(lightPosEyeFelinar) - fPosEyeF.xyz));
   

  

  //viewDir e aceeasi ca e acelasi privitoru adica camera
  vec3 viewDirF = normalize(- fPosEyeF.xyz);

   //pt atenuare
     //compute distance to light
            float dist = length(lightPosEyeFelinar - fPosEyeF);
     //compute attenuation
           float att = 1.0f / (constant + 0.7 * dist + 1.5 * (dist * dist));

    //compute ambient light
    ambientFelinar = att*ambientStrength * lightColorFelinar;

    //compute diffuse light
    difuzaFelinar = att*max(dot(normalEyeF, lightDirNFelinar), 0.0f) * lightColorFelinar;

    //compute specular light
    vec3 reflectDirFelinar = reflect(-lightDirNFelinar, normalEyeF);
    float specCoeffFelinar = pow(max(dot(viewDirF, reflectDirFelinar), 0.0f), 32);
    specularFelinar = att*0.9 * specCoeffFelinar * lightColorFelinar;

}*/

float computeShadow()
{
   //perform perspective divide
   //returneaza pozitia fragmentului curent in intervalul [-1, 1]
   vec3 normalizedCoords= fragPosLightSpace.xyz / fragPosLightSpace.w;

   //Transform to [0,1] range -> transformam coordonatele in [0,1]
   normalizedCoords= normalizedCoords *0.5 +0.5;

   //get closest depth value from light's perspective
   float closestDepth= texture(shadowMap, normalizedCoords.xy).r;

   //get depth of current fragment from light's perspective
   //cea mai apropiata valoare de adancime din perspectiva luminii 
   float currentDepth= normalizedCoords.z;

   //check whether current frag pos is in shadow
   //float shadow= currentDepth > closestDepth ? 1.0 : 0.0;

   //check whether current frag pos is in shadow
   //without shadow acne
   float bias=0.005f;
   float shadow= currentDepth - bias > closestDepth ? 1.0f : 0.0f;

   if(normalizedCoords.z >1.0f)
       return 0.0f;
 
   return shadow;
}

//Calculez CEATA
float computeFog()
{
   float fogDensity=0.05f;
   vec4 fragmentPosEyeSpace = view * model * vec4(fPosition, 1.0f);
   float fragmentDistance= length(fragmentPosEyeSpace);
   float fogFactor=exp(-pow(fragmentDistance * fogDensity, 2));

   return clamp(fogFactor, 0.0f, 1.0f);
}

void main() 
{
    computeDirLight(); //lumina directionala 

    //lumina punctiforma de la felinarul de langa casa
    computeDirLightFelinarC();

    //umbra
    float shadow=computeShadow();

    //ceata
    float fogFactor=computeFog();
    vec4 fogColor=vec4(0.2f, 0.2f, 0.2f, 1.0f);

     //calculez lumina 
     ambient *= texture(diffuseTexture, fTexCoords).rgb;
     diffuse *= texture(diffuseTexture, fTexCoords).rgb;
     specular *= texture(specularTexture, fTexCoords).rgb;

    //compute final vertex color
    vec3 color = min((ambient + ambientFelinarC+ (1.0f-shadow)*(diffuse + diffuseFelinarC)) * texture(diffuseTexture, fTexCoords).rgb + ((1.0f-shadow)*(specular + specularFelinarC))* texture(specularTexture,fTexCoords).rgb , 1.0f);

// vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);

    fColor = vec4(color, 1.0f); //-> inainte de ceata 
    //fColor dupa ceata
   // vec4 culoareInitiala=vec4(color, 1.0f);
   // fColor= mix(fogColor, culoareInitiala, fogFactor);
}
