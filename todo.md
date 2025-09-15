_______________________________________

Permisisons Table add one more column group 
where we can add like user , role this will help to club permssions 


$user = \App\Models\CentralUser::find(1);
$user->notify(new App\Notifications\TestNotification('Chrome'));


use resource and collection on backend and then on front udapte the interfaces accordingly try to have all the type script related code in type files except for props or other such one of things

dir structure naming convention

frontend dir names and files name naming convetions need to be update
small letters no caps
no need to use camel case

ex InviteAcceptance should be invite-acceptance

__________________________________________
review the does and dont's for backend
Request
Contoller
Service
Resource/Collection

code properly splited in to these 

________________________________________
seprate type script files, code slit into small dumb components
use of hook and ulits where usefull
always use inertia isnted of other options


*********************************************
Multitenancy (1)
Packages Subscriptions (1-2)
Custom Fields (1-2)
PWA (1-2)

Master Admin (2)
Support Feature (2)

Temp db Feature (3)

AI intigration (4)
*******************************************

How to add a system enrty or later when a support user wokrs on clients behalf how to create session how to display in logs

Use delay for loggin activity 

Servicewroker allowed dir path needs to be ristricted




Cache was moved temprarly to file need to fix this 

global id can be created on boot in central user

insted of these two line we can use a keyword

    need to have a central way to manage favriot tenant login


    Responsive Dialog
    You can combine the Dialog and Drawer components to create a responsive dialog. This renders a Dialog component on desktop and a Drawer on mobile.

    We will use this every where we have a dialog


Document for Notfication, Activity log, Permissions 

Things to Test 
Disabled user login and tenant switch

Invite email url need to have a tenat id 