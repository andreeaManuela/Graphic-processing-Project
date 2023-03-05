#include "Camera.hpp"
#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <glm/gtx/euler_angles.hpp>

namespace gps {

    //Camera constructor
    Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
        
       this->cameraPosition = cameraPosition;
       this->cameraTarget = cameraTarget;
       this->cameraUpDirection = cameraUp;

        //TODO - Update the rest of camera parameters

        //Curs 4
       //Calcularea matricii View-> v r u
       
        // -v = l-c/ ||c-l|| 
        this->cameraFrontDirection = glm::normalize(this->cameraTarget - this->cameraPosition);

        //vectorul r -> produs vectorial din u' si v 
        //u' este deobicei axa y => (0,1,0)
        //r = - (vxu')/||vxu'||
        this->cameraRightDirection = - glm::normalize(glm::cross(-cameraFrontDirection, glm::vec3(0.0f,1.0f,0.0f)));
        
        //u -> directia sus a camerei
        // u= vxr
        this->cameraUpDirection = glm::cross(-cameraFrontDirection, cameraRightDirection);

        //pozitiile originale a camerei 
        this-> cameraUpOriginalPosition= cameraUp;
        this-> cameraFrontOriginalPosition=cameraTarget;

        /*
        this->cameraPosition = cameraPosition;
        this->cameraTarget = cameraTarget;
        this->cameraFrontDirection = glm::normalize(this->cameraTarget - this->cameraPosition);
        this->cameraUpDirection = glm::vec3(0.0f, 1.0f, 0.0f);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection));*/


    }

    //return the view matrix, using the glm::lookAt() function
    glm::mat4 Camera::getViewMatrix() {
        return glm::lookAt(cameraPosition, cameraTarget, cameraUpDirection);
        //return glm::lookAt(this->cameraPosition, this->cameraPosition + this->cameraFrontDirection, this->cameraUpDirection);
    }

    //update the camera internal parameters following a camera move event
    void Camera::move(MOVE_DIRECTION direction, float speed) {
       
        if (direction == gps::MOVE_FORWARD)
        {
            //cnew= c+ speed* (-v)
            this->cameraPosition = this->cameraPosition + speed * this->cameraFrontDirection;
        }
        else if (direction == gps::MOVE_BACKWARD)
        {
            //cnew=c+speed*v
            this->cameraPosition = this->cameraPosition - speed * this->cameraFrontDirection;
        }
        //pentru a ne misca lateral folosim produs vectorial
        else if (direction == gps::MOVE_LEFT)
        {
            //this->cameraPosition = this->cameraPosition - glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection)) * speed;
            this->cameraPosition = this->cameraPosition -  this->cameraRightDirection* speed;
        }
        else if (direction == gps::MOVE_RIGHT)
        {
            //this->cameraPosition = this->cameraPosition + glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection)) * speed;
            this->cameraPosition = this->cameraPosition + this->cameraRightDirection * speed;
        }

        //actualizez camera target si camera position pe masura ce ma misc
        cameraTarget = cameraPosition + cameraFrontDirection;

        /*
        switch (direction) {
        case gps::MOVE_FORWARD:
            this->cameraPosition += this->cameraFrontDirection * speed;
            break;
        case gps::MOVE_BACKWARD:
            this->cameraPosition -= this->cameraFrontDirection * speed;
            break;
        case gps::MOVE_RIGHT:
            this->cameraPosition += glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection)) * speed;
            break;
        case gps::MOVE_LEFT:
            this->cameraPosition -= glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection)) * speed;
            break;
        }*/



    }

    //update the camera internal parameters following a camera rotate event
    //yaw - camera rotation around the y axis
    //pitch - camera rotation around the x axis
    void Camera::rotate(float pitch, float yaw) {
        //TODO
        
        glm::mat4 matriceEuler = glm::yawPitchRoll(glm::radians(yaw), glm::radians(pitch), 0.0f);
        glm::vec4 originalCameraFront = glm::vec4(this->cameraFrontOriginalPosition, 0.0f);
        //v= Euler*originalPosition / ||Euler* originalPosition||
       this->cameraFrontDirection = glm::vec3(glm::normalize(matriceEuler*glm::vec4(this->cameraFrontOriginalPosition,0.0f)));

       //r
       this->cameraRightDirection = -glm::normalize(glm::cross(-this->cameraFrontDirection, this->cameraUpOriginalPosition));

       //u , e -v pentru ca mai sus am calculat -v => -(-v)
       this->cameraUpDirection = glm::cross(-this->cameraFrontDirection, this->cameraRightDirection);


       cameraTarget = cameraPosition + cameraFrontDirection;

        /*
        glm::vec3 front;
        front.x = cos(glm::radians(yaw)) * cos(glm::radians(pitch));
        front.y = sin(glm::radians(pitch));
        front.z = sin(glm::radians(yaw)) * cos(glm::radians(pitch));

        this->cameraTarget = front;
        this->cameraFrontDirection = glm::normalize(front);
        this->cameraRightDirection = glm::normalize(glm::cross(this->cameraFrontDirection, this->cameraUpDirection));*/

    }
}