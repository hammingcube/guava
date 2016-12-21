package main

import (
	"flag"
	"github.com/labstack/echo"
	"gopkg.in/zabawaba99/firego.v1"
	"log"
	"net/http"
)

var (
	url      = flag.String("url", "https://playlist-15c25.firebaseio.com", "firebase database url")
	firebase *firego.Firebase
)

type Incoming struct {
	Title string `json:"title"`
	Track string `json:"track"`
	Album string `json:"album"`
}

func storeInFirebase(firebase *firego.Firebase, p *Incoming) error {
	if _, err := firebase.Child("songs").Push(p); err != nil {
		return err
	}
	return nil
}

func main() {
	flag.Parse()
	firebase = firego.New(*url, nil)
	e := echo.New()
	e.POST("/submit", func(c echo.Context) error {
		v := &Incoming{}
		if err := c.Bind(v); err != nil {
			log.Fatalf("error: %v", err)
			return err
		}
		log.Printf("Got: %#v", v)
		if err := storeInFirebase(firebase, v); err != nil {
			log.Fatalf("error: %v", err)
			return err
		}
		return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
	})
	if err := e.Start(":3075"); err != nil {
		log.Fatal(err)
	}
}
