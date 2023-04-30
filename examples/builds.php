<?php

header("Content-Type: application/json");

$result = [];

if (isset($_GET["abbreviation"])) {
   $abbreviation = strtolower($_GET["abbreviation"]);
   $endpoint = "https://raw.githubusercontent.com/HighlanderCZ/inj2-mobile-hero-builds/main/builds.json";

   $curl = curl_init($endpoint);
   curl_setopt($curl, CURLOPT_URL, $endpoint);
   curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

   $curl_result = curl_exec($curl);
   curl_close($curl);

   if (!$curl_result) {
      $result["status"] = "error";
      $result["message"] = "Unable to fetch data";
   } else {
      $response = json_decode($curl_result, true);

      if (isset($response["heroes"])) {
         $heroes = array_filter($response["heroes"], function ($hero) use ($abbreviation) {
            return in_array($abbreviation, $hero["abbreviations"]);
         });

         if (count($heroes) > 0) {
            $result["status"] = "success";
            $result["data"] = array_values($heroes)[0];
         } else {
            $result["status"] = "error";
            $result["message"] = "No builds exist for '$abbreviation'";
         }
      } else {
         $result["status"] = "error";
         $result["message"] = "Unable to fetch data";
      }
   }
} else {
   $result["status"] = "error";
   $result["message"] = "Missing argument 'abbreviation'";
}

echo json_encode($result);
