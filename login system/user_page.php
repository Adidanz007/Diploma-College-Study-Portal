<?php

@include 'config.php';

session_start();

if(!isset($_SESSION['user_name'])){
   header('location:login_form.php');
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>user page</title>

   <!-- custom css file link  -->
   <link rel="stylesheet" href="style.css">

</head>
<body>
   
<div class="container">

   <div class="content">
      <h3>hi, <span>user</span></h3>
      <h1>welcome <span><?php echo $_SESSION['user_name'] ?></span></h1>
      <p>this is an user page</p>
      <a href="login_form.php" class="btn">login</a>
      <a href="register_form.php" class="btn">register</a>
      <a href="logout.php" class="btn">logout</a>
   </div>


   <h1>Scroll To Get Old PYQ's ⤵️</h1>
</div>


<!-- comman-subjects-all-the-stubects -->

<div class="course">
        <h2>Common Subjects for All Branches</h2>
        <table>
            <caption>Old Question Papers </caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Click to Access</th>
            </tr>
            <tr>
                <td>Mathematics</td>
                <td>1st</td>
                <td>
                    <a target="_blank" href="./pdf's/maths paper 1.pdf">April/May -2021.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 2.pdf">Oct/Nov - 2021.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 3.pdf">March/April - 2022.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 4.pdf">August/September - 2022.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 5.pdf">(Makeup) Examination Nov/Dec - 2022. </a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 6.pdf">Feb / March - 2023.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 7.pdf"> June/July - 2023.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths paper 8.pdf"> (Makeup) Examination-Sept.2023.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/maths10.pdf"> December - 2023.</a><br>
                    <hr>
                </td>
            </tr>
            <tr>
                <td>Project Management Skills (PMS)</td>
                <td>1st</td>
                <td>
                    <a target="_blank" href="./pdf's/pms4.pdf">March/April - 2022.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms7.pdf">August/September - 2022.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms1.pdf">(Makeup) Examination Nov/Dec - 2022. </a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms5.pdf">Feb / March - 2023.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms6.pdf">June/July - 2023. </a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms3.pdf">(Makeup) Examination-Sept.2023.</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/pms2.pdf"> December - 2023</a><br>
                    <hr>

                </td>
            </tr>
            </tr>

            </tr>
        </table>
    </div>


    <!-- Computer Science Engineering -->

    <div class="course">
        <h2>Computer Science Engineering</h2>
        <p><img src="computer.png" alt=""></p>
        <p>Welcome to the Computer Science Department's resource hub, your gateway to a wealth of materials tailored to enhance your understanding and proficiency in various aspects of computer science. Whether you're a novice eager to dive into the fundamentals
            or a seasoned professional seeking advanced knowledge, our repository has something for everyone.</p>
        <p>Instructor:Mr. A. P. Jinagi, HOD </p>
        <table>
            <caption>Old Question Papers</caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Access</th>
            </tr>
            <tr>
                <td>Fundamentals of computer (FOC)</td>
                <td>1st</td>
                <td>
                    <a target="_blank" href="./pdf's/foc3.pdf">October/November - 2021</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/foc2.pdf">August/September - 2022</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/foc4.pdf">(Makeup) Examination November - 2022</a><br>
                    <hr>
                </td>
            </tr>
            <tr>
                <td>Full Stack Development (FSD) </td>
                <td>3rd</td>
                <td>
                    <a target="_blank" href="./pdf's/fsd1.pdf">(Makeup) Examination November - 2022</a><br>
                    <hr>
                </td>
            </tr>
        </table>
    </div>


    <div class="course">
        <h2>Electrical and Electronics Engineering</h2>
        <p><img src="../electrical-removebg-preview.png" alt=""></p>
        <p>Welcome to the resource center of the Electrical and Electronics Engineering, your one-stop destination for accessing a diverse array of materials tailored to support your academic and professional pursuits in Electrical and Electronics Engineering.
            Here's what you can expect.</p>

        <p>Instructor: black</p>
        <table>
            <caption>Old Question Papers</caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Access</th>
            </tr>
            <tr>
                <td>Circuit Theory</td>
                <td>1st</td>
                <td><a href="#">Access</a></td>
            </tr>
            <tr>
                <td>Electromagnetic Field Theory</td>
                <td>5th</td>
                <td><a href="#">Access</a></td>
            </tr>
            
        </table>
    </div>


    <div class="course">
        <h2>Electronics & Communication Engineering</h2>
        <p><img src="../e_c-removebg-preview.png" alt=""></p>
        <p>Welcome to the resource center of the Electronics & Communication Engineering, your one-stop destination for accessing a diverse array of materials tailored to support your academic and professional pursuits in Electronics & Communication Engineering.
            Here's what you can expect.</p>

        <p>Instructor: black</p>
        <table>
            <caption>Old Question Papers</caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Access</th>
            </tr>
            <tr>
                <td>Digital Electronics</td>
                <td>1st</td>
                <td>
                    <a target="_blank" href="./pdf's/ec14.pdf">April/May - 2021</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/ec13.pdf">October/November - 2021</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/ec12.pdf">March/April - 2022</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/ec15.pdf">August/September - 2022</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/ec11.pdf">November/December - 2022</a><br>
                    <hr>
                    <a target="_blank" href="./pdf's/ec16.pdf">December - 2023</a><br>
                    <hr>
                </td>
            </tr>
            <tr>
                <td>Electromagnetic Field Theory</td>
                <td>5th</td>
                <td>
                    <a target="_blank" href="./pdf's/ec51.pdf">June/July - 2023</a><br>
                    <hr>
                </td>
            </tr>
            
        </table>
    </div>


    <div class="course">
        <h2>Civil Engineering</h2>
        <p><img src="../civil-removebg-preview.png" alt=""></p>
        <p>Welcome to the resource center of the Civil Engineering department, your one-stop destination for accessing a diverse array of materials tailored to support your academic and professional pursuits in civil engineering. Here's what you can expect.</p>

        <p>Instructor: Mr. I.C.Haigar, HOD</p>
        <table>
            <caption>Old Question Papers</caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Access</th>
            </tr>
            <tr>
                <td>Circuit Theory</td>
                <td>1st</td>
                <td><a target="_blank" href="./pdf's/ce11.pdf">June/July - 2023</a><br>
                    <hr></td>
            </tr>
            <tr>
                <td>Electromagnetic Field Theory</td>
                <td>5th</td>
                <td><a href="#">Access</a></td>
            </tr>
            
        </table>
    </div>


    <div class="course">
        <h2>Mechanical Engineering</h2>
        <p><img src="../mechinical-removebg-preview.png" alt=""></p>
        <p>Welcome to the resource center of the Mechanical Engineering, your one-stop destination for accessing a diverse array of materials tailored to support your academic and professional pursuits in Mechanical Engineering. Here's what you can expect.</p>

        <p>Instructor: black</p>
        <table>
            <caption>Old Question Papers</caption>
            <tr>
                <th>Subject</th>
                <th>Semester</th>
                <th>Access</th>
            </tr>
            <tr>
                <td>Materials Of Engineering</td>
                <td>1st</td>
                <td>
                    <a target="_blank" href="pdf's/me18.pdf">April/May - 2021</a>
                    <hr>
                    <a target="_blank" href="pdf's/me13.pdf">October/November - 2021</a>
                    <hr>
                    <a target="_blank" href="pdf's/me16.pdf">March/April - 2022</a>
                    <hr>
                    <a target="_blank" href="pdf's/me14.pdf">August/September - 2022</a>
                    <hr>
                    <a target="_blank" href="pdf's/me15.pdf">(Makeup) Examination November/December - 2022</a>
                    <hr>
                    <a target="_blank" href="pdf's/me19.pdf">February/March - 2023</a>
                    <hr>
                    <a target="_blank" href="pdf's/me11.pdf">June/July - 2023</a>
                    <hr>
                    <a target="_blank" href="pdf's/me12.pdf">(Makeup) Examination September - 2023</a>
                    <hr>
                    <a target="_blank" href="pdf's/me17.pdf">December - 2023</a>
                    <hr>


                </td>
            </tr>
            <tr>
                <td>Heating Vantilation & Air Conditioning (HVAC)</td>
                <td>5th</td>
                <td>
                    <a target="_blank" href="pdf's/me51.pdf">June/July - 2023</a>
                    <hr>
                </td>
            </tr>
            <tr>
                <td>Automation & Robotics (AR)</td>
                <td>5th</td>
                <td>
                    <a target="_blank" href="pdf's/me52.pdf">June/July - 2023</a>
                    <hr>
                </td>
            </tr>

        </table>
    </div>






    <!-- Back to Home Button -->
    <div class="back-to-home">
        <a href="/FinalYearProject/index.html" class="back-btn">← Back to Home</a>
    </div>
</body>
</html>
