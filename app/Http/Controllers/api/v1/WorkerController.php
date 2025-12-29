<?php

namespace App\Http\Controllers\api\v1;

use App\Http\Controllers\Controller;
use App\Models\Balance;
use App\Models\DiscountUsage;
use App\Models\Event;
use App\Models\Order;
use App\Models\Ticket;
use App\Models\Tour;
use App\Models\Temp;
use App\Models\Client;
use App\Models\Shift;
use App\Models\Job;
use App\Models\TimeSheet;
use App\Models\WorkerlyUser;
use App\Models\Attachment;
use Exception;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\RequestEmail;
use Illuminate\Support\Facades\Validator;
use PDF;
use Illuminate\Support\Facades\Http;
use Redirect;
use SimpleSoftwareIO\QrCode\Facades\QrCode;





class WorkerController extends Controller
{
    public function generateRandomLetters() {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < 6; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return 'Chale_'.$randomString;
    }

    public function getClients(Request $request) {
        try {
            
            $clients = Client::get();

           // return response()->json(['clients' => $clients], 200);
            return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function AddClient(Request $request) {
        try {

            if(isset($request->avatar)=='null')
            {

            }
            else
            {
                $request->validate([
                    'name' => 'required|string|max:255',
                    'address' => 'required|string|max:255',
                    'phone' => 'required|string|max:20',
                    'email' => 'required|string|email|max:255',
                    'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                ]);
            }
             
            
            $clients = Client::where('email', $request->email)->first();

            // if ($clients) {
            //     return response()->json(['error' => 'Client already exists'], 400);
            // }
            // else
            // {
                 if ($request->hasFile('avatar')) {
                    
                    // Delete old avatar if it exists
                    // if ($clients->avatar) {
                    //     Storage::delete('public/clients' . $clients->avatar);
                    // }
                    $path = $request->file('avatar')->store('clients', 'public');
                   // $data['avatar'] = $path;
                }
                else{
                    $path = ""; // Set to null if no avatar is uploaded
                }

                //print_r($path);
                
                
                $client = new Client();
                $client->name = $request->name;
                $client->email = $request->email;
                $client->phone = $request->phone;
                $client->address = $request->address;
                $client->avatar = $path; // Store the avatar path
                $client->save();

                // Optionally, you can return the created client
                return response()->json(['client' => 'New Client Added'], 201);
            //}

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getClient(Request $request) {
        try {
            
            $clients = Client::where('id', $request->id)->first();

           // return response()->json(['clients' => $clients], 200);
            return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function UpdateClient(Request $request) {
        try {
            
            if(isset($request->avatar)=='null')
            {

            }
            else
            {
               $request->validate([
                    'name' => 'required|string|max:255',
                    'address' => 'required|string|max:255',
                    'phone' => 'required|string|max:20',
                    'email' => 'required|string|email|max:255',
                    'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                ]);
            }
                

                $clients = Client::where('id', $request->id)->first();

                $data = $request->only(['name', 'address', 'phone', 'email']);

                if ($request->hasFile('avatar')) {
                    // Delete old avatar if it exists
                    if ($clients->avatar) {
                        Storage::delete('public/clients' . $clients->avatar);
                    }
                    $path = $request->file('avatar')->store('clients', 'public');
                    $data['avatar'] = $path;
                }

                $clients->update($data);

                return response()->json($clients);
    
            

            // if ($clients) {
            //     // $client = new Client();
            //     // $client->name = $request->name;
            //     // $client->email = $request->email;
            //     // $client->phone = $request->phone;
            //     // $client->address = $request->address;
            //     $clients->update(['name' => $request->name, 'email' => $request->email,'phone' => $request->phone, 'address' => $request->address]);

            //     return response()->json(['client' => 'Client Updated'], 201);
            // }
            // else
            // {
            //    return response()->json(['error' => 'Client Does Not Exist'], 400);

            //     // Optionally, you can return the created client
                
            // }

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

////////////////SHIFTS
    public function AddShift(Request $request) {
        try {
                $validator = Validator::make($request->all(), [
                    'job_id' => 'required|exists:jobs,id',
                    'client_id' => 'required|exists:clients,id',
                    'startTime' => 'required|date',
                    'endTime' => 'required|date|after_or_equal:startTime',
                    'notes' => 'nullable|string',
                    'temp_ids' => 'nullable|array', // Expect an array of temp IDs
                    'temp_ids.*' => 'exists:temps,id', // Validate that each ID in the array exists
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 422);
                }

                $shift = Shift::create($request->all());
                $shift->temps()->sync($request->temp_ids);


                foreach($request->temp_ids as $temp_id){
                    ///Get Job Details
                        $job = Job::where('id', $request->job_id)->first();
                    
                        ///Get Client Details
                        $client = Client::where('id', $request->client_id)->first();

                        ///Get Temp Details
                        $temp = Temp::where('id', $temp_id)->first();

                        ////Send SMS
                        $curl = curl_init();

                        curl_setopt_array($curl, [
                            CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
                            CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
                            CURLOPT_RETURNTRANSFER => true,
                            CURLOPT_ENCODING => '',
                            CURLOPT_MAXREDIRS => 10,
                            CURLOPT_TIMEOUT => 0,
                            CURLOPT_FOLLOWLOCATION => true,
                            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                            CURLOPT_CUSTOMREQUEST => 'POST',
                            CURLOPT_POSTFIELDS => http_build_query([
                                'sender' => 'Workerly',
                                'message' => 'You have been assigned to a shift '.$job->title.' for '.$client->name.'. Login to your account to view full details',
                                'recipients' => [$temp->phone],
                                // When sending SMS to Nigerian recipients, specify the use_case field
                                // 'use_case' => 'transactional'
                            ]),
                        ]);

                        $response = curl_exec($curl);
                        curl_close($curl);
                        //echo $response;
                }
                

                return response()->json($shift->load('job', 'client', 'temps'), 201);

                //  $shift = Shift::create([
                //     'job_id' => $request->job_id,
                //     'client_id' => $request->client_id,
                //     'startTime' => $request->start_time,
                //     'endTime' => $request->end_time,
                //     'notes' => $request->notes,
                //     'status' => 'pending', // Default status
                // ]);

                 // Attach the temps to the shift using the pivot table
                // The attach() method is the key to the many-to-many relationship
                // $shift->temps()->attach($request->temp_ids);

                // // Return the new shift with the assigned temps loaded
                // return response()->json($shift->load('temps'), 201);





           
                // $client = new Shift();
                // $client->job = $request->job;
                // $client->temp = $request->temp;
                // $client->client = $request->client;
                // $client->startTime = $request->startTime;
                // $client->endTime = $request->endTime;
                // $client->notes = $request->notes;
                // $client->status = 'pending'; // Default status
                // $client->save();

                // // Optionally, you can return the created client
                // return response()->json(['client' => 'New Shift Assigned'], 201);


                //Send Emails
            

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getShifts(Request $request) {
        try {
            
           
            $shifts = Shift::with(['job', 'client', 'temps'])->latest()->get();

           return response()->json($shifts);
            // ->join('clients', 'jobs.client', '=', 'clients.id')
            // //->select('users.name', 'posts.title', 'posts.content')
            // ->get();

            //return response()->json(['clients' => $clients], 200);
            //return json_decode($clients, true);
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getShift(Request $request) {
        try {
            
            $shifts = Shift::with(['job', 'client', 'temps'])->where('id',$request->id)->latest()->get();

            return response()->json($shifts);
           
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function UpdateShift(Request $request,Shift $shift) {
        try {

                $validator = Validator::make($request->all(), [
                    'job_id' => 'sometimes|required|exists:jobs,id',
                    'client_id' => 'sometimes|required|exists:clients,id',
                    'startTime' => 'sometimes|required|date',
                    'endTime' => 'sometimes|required|date|after_or_equal:startTime',
                    'notes' => 'nullable|string',
                    'temp_ids' => 'nullable|array',
                    'temp_ids.*' => 'exists:temps,id',
                    'status' => 'sometimes|in:pending,checked-in,started,completed',
                ]);

                if ($validator->fails()) {
                    return response()->json($validator->errors(), 422);
                }

                // Check if shift is in a timesheet
                if ($shift->isInTimesheet()) {
                    return response()->json(['error' => 'Cannot update shift that is already in a timesheet'], 400);
                }

                // Update shift fields, including temp_ids
                $updateData = $request->all();
                DB::table('shifts')->where('id', $request->id)->update($updateData);
                // Reload the shift model to ensure it's fresh
                $shift = Shift::find($request->id);
                $shift->temps()->sync($request->temp_ids);

                return response()->json($shift->fresh(['job', 'client', 'temps']));

                // $shift = Shift::where('id', $request->id)->first();
                // // Update the shift's main attributes
                //  $data = [
                //     'job_id' => $request->job_id,
                //     'client_id' => $request->client_id,
                //     'startTime' => $request->start_time,
                //     'endTime' => $request->end_time,
                //     'notes' => $request->notes,
                //    // 'status' => $request'pending', // Default status
                // ];
                // //return $data;
                // //$shift->update($request->except('temp_ids'));
                // $shift->update($data);
                //  // If temp_ids are provided, sync them with the pivot table
                // if ($request->has('temp_ids')) {
                //     $shift->temps()->sync($request->temp_ids);
                // }

                // // Return the updated shift with its relations loaded
                // return response()->json($shift->load(['job', 'client', 'temps']));

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function UpdateShiftStat(Request $request,Shift $shift) {
        try {
            $shift = Shift::where('id', $request->id)->first();

            if ($request->has('temp_id')) {
                // Update the pivot table shift_temps
                $pivotData = [];

                if ($request->status == 'checked-in') {
                    $pivotData['tempStatus'] = $request->status;
                    $pivotData['checkedInAt'] = $request->checkedInAt;
                    if ($request->has('deduction')) {
                        $pivotData['deduction'] = $request->deduction;
                    }
                } elseif ($request->status == 'completed') {
                    $pivotData['tempStatus'] = $request->status;
                    $pivotData['checkedOutAt'] = $request->checkedOutAt;
                } else {
                    $pivotData['tempStatus'] = $request->status;
                }

                $shift->temps()->updateExistingPivot($request->temp_id, $pivotData);
            } else {
                // Update the shift table directly (legacy behavior)
                $data = ['status' => $request->status];

                if ($request->status == 'checked-in') {
                    $data['checkedInAt'] = $request->checkedInAt;
                    if ($request->has('deduction')) {
                        $data['deduction'] = $request->deduction;
                    }
                } elseif ($request->status == 'completed') {
                    $data['checkedOutAt'] = $request->checkedOutAt;
                }

                $shift->update($data);
            }

            // Return the updated shift with its relations loaded
            return response()->json($shift->load('temps'));

        } catch (Exception $e) {
            Log::error('Error updating shift status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function UpdateShiftTStat(Request $request,Shift $shift) {
        try {
            
                $tempId = $request->temp[0]; // Assuming temp is an array with one temp id
                $status = $request->status;

                // Update the pivot table shift_temps for the specific temp and shift
                $shift->temps()->updateExistingPivot($tempId, ['tempStatus' => $status]);

                $getTemp = Temp::where('id', $tempId)->first();

                if($status == 'accepted' || $status == 'declined') {
                    ////Send SMS
                    $curl = curl_init();

                    curl_setopt_array($curl, [
                        CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
                        CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_ENCODING => '',
                        CURLOPT_MAXREDIRS => 10,
                        CURLOPT_TIMEOUT => 0,
                        CURLOPT_FOLLOWLOCATION => true,
                        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                        CURLOPT_CUSTOMREQUEST => 'POST',
                        CURLOPT_POSTFIELDS => http_build_query([
                            'sender' => 'Workerly',
                            'message' => $getTemp->firstName.' '.$getTemp->lastName.' has '.$status.' the assigned shift. Login to your account to view full details',
                            'recipients' => ['0203558151'],
                            // When sending SMS to Nigerian recipients, specify the use_case field
                            // 'use_case' => 'transactional'
                        ]),
                    ]);

                    $response = curl_exec($curl);
                    curl_close($curl);
                }

                // Return the updated shift with its relations loaded
                return response()->json($shift->load('temps'));

        } catch (Exception $e) {
            Log::error('Error updating temp status: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    //get shifts for a specific temp
    // This method retrieves all shifts that a specific temp is assigned to.
    public function getTempShifts(Request $request) {
        try {
            
            $shifts = Shift::with(['job', 'client', 'temps'])
                ->whereHas('temps', function ($query) use ($request) {
                    $query->where('temp_id', $request->tempId);
                })
                ->latest()
                ->get();

            return response()->json($shifts);
           
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


////////JOBS
    public function AddJob(Request $request) {
        try {
            
                $validatedData = $request->validate([
                    'title' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'client_id' => 'required|exists:clients,id', // Validates that the client exists
                    'startDate' => 'required|date',
                    'endDate' => 'required|date|after_or_equal:start_date',
                    'workhours' => 'required|string',
                    'experience' => 'sometimes|array',
                    'attachments' => 'nullable|array',
                    'attachments.*' => 'file|mimes:pdf,doc,docx,xlsx,excel|max:2048', // Validate each attachment
                    'status' => 'required|string',
                    'payRate' => 'required|numeric',
                ]);

                //  if ($validator->fails()) {
                //     return response()->json($validator->errors(), 422);
                // }

                $job = Job::create([
                    'title' => $validatedData['title'],
                    'description' => $validatedData['description'],
                    'client_id' => $validatedData['client_id'],
                    'startDate' => $validatedData['startDate'],
                    'endDate' => $validatedData['endDate'],
                    'payRate' => $validatedData['payRate'],
                    'status'=> $validatedData['status'],
                    // Add any other job fields here
                ]);

                if ($request->hasFile('attachments')) {
                    foreach ($request->file('attachments') as $file) {
                        // Store the file and get its path
                        $path = $file->store('attachments', 'public');
                         // Create an attachment record and associate it with the job
                        $job->attachments()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                        ]);
                    }
                }

                //$fileNames = [];

                
               
                return response()->json($job->load('attachments'), 201);
    
                 

               // $job = Job::create($validator->validated());
                //  $data = [
                //     'title' => $request->input('title'),
                //     'description' => $request->input('description'),
                //     'client_id' => $request->input('client_id'),
                //     'startDate' => $request->startDate,
                //     'endDate' => $request->endDate, 
                //     'workhours' => $request->workhours,
                //     'experience' => $request->experience,
                //     'status' => 'Assigning In Progress', // Default status
                //     //'attachments' => json_encode($fileNames), // Store as JSON array
                //     'payRate' => $request->payRate,
                // ];
                // $job = Job::create($data);

                
                // $client = new Job();
                // $client->title = $request->title;
                // $client->description = $request->description;
                // $client->clientId = $request->clientId;
                // $client->startDate = $request->startDate;
                // $client->endDate = $request->endDate;
                // $client->workhours = $request->workhours;
                // $client->experience = $request->experience;
                // $client->status = 'Assigning In Progress'; // Default status
                // $client->attachments = $fileNames; // Store as JSON array
                // $client->payRate = $request->payRate;
                // $client->save();
               //return response()->json($job->load('client'), 201);
                // Optionally, you can return the created client
                //return response()->json(['client' => 'New Job Added'], 201);

        } catch (Exception $e) {
            Log::error('Error Saving Job: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getJobs(Request $request) {
        try {
            
            //$clients = Job::get();

            //$clients = DB::table('jobs')->get();
            $jobs = Job::with('client')->latest()->get();

            return response()->json($jobs);
            // ->join('clients', 'jobs.client', '=', 'clients.id')
            // //->select('users.name', 'posts.title', 'posts.content')
            // ->get();

            //return response()->json(['clients' => $clients], 200);
            //return json_decode($clients, true);
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getJob(Request $request) {
        try {
            
            //$clients = Job::get();

            //$clients = DB::table('jobs')->get();
            //$jobs = Job::with(['client','attachments'])->where('id',$request->id)->latest()->get();
            $jobs = Job::with(['client','attachments'])->findOrFail($request->id);
            return response()->json($jobs);
            // ->join('clients', 'jobs.client', '=', 'clients.id')
            // //->select('users.name', 'posts.title', 'posts.content')
            // ->get();

            //return response()->json(['clients' => $clients], 200);
            //return json_decode($clients, true);
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function UpdateJob(Request $request) {
        try {
             $job = Job::findOrFail($request->id);

                $validatedData = $request->validate([
                    'title' => 'required|string|max:255',
                    'description' => 'required|string',
                    'client_id' => 'required|exists:clients,id',
                    'startDate' => 'required|date',
                    'endDate' => 'required|date|after_or_equal:startDate',
                    'payRate' => 'required|numeric',
                    'attachments' => 'nullable|array', // New attachments will be in an array
                    'attachments.*' => 'file|mimes:pdf,doc,docx,xlsx,excel|max:2048' // Validate each new file
                ]);

                // 3. Update the job's core details
                $job->update([
                    'title' => $validatedData['title'],
                    'description' => $validatedData['description'],
                    'client_id' => $validatedData['client_id'],
                    'startDate' => $validatedData['startDate'],
                    'endDate' => $validatedData['endDate'],
                    'payRate' => $validatedData['payRate'],
                    // Add any other updatable job fields here
                ]);

                // 4. Handle any newly uploaded attachments
                if ($request->hasFile('attachments')) {
                    foreach ($request->file('attachments') as $file) {
                        // Store the new file
                        $path = $file->store('attachments', 'public');

                        // Create a new attachment record associated with the job
                        $job->attachments()->create([
                            'file_name' => $file->getClientOriginalName(),
                            'file_path' => $path,
                        ]);
                    }
                }

            // if ($request->hasFile('attachments')) {
            //         foreach ($request->file('attachments') as $file) {
            //             // Save the file to the 'public' directory
            //             $filePath = $file->store('jobs', 'public');

            //             // Extract the filename
            //             $fileName = basename($filePath);

            //             // Save the filename to the database
            //             //File::create(['filename' => $fileName]);

            //             // Optionally, store filenames in an array for further use
            //             $fileNames[] = $fileName;
            //         }
            //     }
           
           
           
            // if ($clients) {
            //     //  return $request->client_id;
            //     if ($request->hasFile('attachments')) {
            //         $attachments = json_encode($fileNames); // Store as JSON array
            //         $data = [
            //             'title' => $request->title,
            //             'description' => $request->description,
            //             'client_id' => $request->client_id,
            //             'startDate' => $request->startDate,
            //             'endDate' => $request->endDate, 
            //             'workhours' => $request->workhours,
            //             'experience' => $request->experience,
            //             'attachments' => $attachments, // Store as JSON array
            //             'status' => $request->status,
            //             'payRate' => $request->payRate
            //         ];
            //         //return $data;
            //         $clients->update($data);
            //     } else {
            //         $attachments = $clients->attachments; // Keep existing attachments if none are uploaded
            //         $newdata = [
            //             'title' => $request->title,
            //             'description' => $request->description,
            //             'client_id' => $request->client_id,
            //             'startDate' => $request->startDate,
            //             'endDate' => $request->endDate, 
            //             'workhours' => $request->workhours,
            //             'experience' => $request->experience,
            //             'attachments' => $attachments, // Keep existing attachments
            //             'status' => $request->status,
            //             'payRate' => $request->payRate
            //         ];
            //        // return $newdata;
            //         $clients->update($newdata);
            //     }
                
                

                return response()->json(['job' => 'Job Updated'], 201);
           

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function UpdateJobStat(Request $request,Shift $shift) {
        try {
            
                $shift = Job::where('id', $request->id)->first();
                // Update the shift's main attributes
                 $data = [
                   'status' => $request->status, // Default status
                ];
              
                //$shift->update($request->except('temp_ids'));
                $shift->update($data);
            
                // Return the updated shift with its relations loaded
                return response()->json($shift);

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function getClientJobs(Request $request) {
        try {
            
            $jobs = Job::with('client')->where('client_id', $request->clientId)->latest()->get();

            return response()->json($jobs);
           
        } catch (Exception $e) {
            Log::error('Error fetching jobs: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function addAttachments(Request $request, Job $job)
    {
        $request->validate([
            'attachments.*' => 'required|file|mimes:pdf,doc,docx,xlsx,excel|max:2048'
        ]);

        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments', 'public');
                $attachments[] = $job->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                ]);
            }
        }

        return response()->json($attachments, 201);
    }
    public function deleteAttachment(Job $job, Attachment $attachment)
    {
        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json(null, 204);
    }
    public function sendAttachmentByEmail(Request $request)
    {
        $request->validate([
            'recipient' => 'required|email',
            'subject' => 'required|string',
            'body' => 'nullable|string',
            'attachmentId' => 'required|exists:attachments,id',
        ]);

        $attachment = Attachment::find($request->attachmentId);

        $data = [
            'recipient' => $request->recipient,
            'subject' => $request->subject,
            'body' => $request->body,
            'attachment' => $attachment,
        ];

        $apiPush = Http::post('https://chaleapp.online/api/v1/SendAttach', $data);
        //return $attachment;
        //return $apiPush;
        if ($apiPush) {
            return response()->json(['success'=>true,'message' => 'Email sent successfully.']);
        } else {
            return response()->json(['success'=>false,'error' => 'Failed to send email.'], 500);
        }
       // Mail::to($request->recipient)->send(new AttachmentMail($attachment, $request->subject, $request->body));

        // return response()->json(['message' => 'Email sent successfully.']);
    }


////////TEMPS
    public function getTemps(Request $request) {
        try {
            
            $clients = Temp::get();

           // return response()->json(['clients' => $clients], 200);
            return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching temps: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function AddTemp(Request $request) {
        try {
            
            $clients = Temp::where('email', $request->email)->first();

            if ($clients) {
                return response()->json(['error' => 'Temp already exists'], 400);
            }
            else
            {
                $client = new Temp();
                $client->title = $request->title;
                $client->firstName = $request->firstName;
                $client->lastName = $request->lastName;
                $client->email = $request->email;
                $client->phone = $request->phone;
                $client->experience = $request->experience;
                $client->status = 'active'; // Default status
                $client->basePay = $request->basePay;
                $client->skills = $request->skills;
                $client->save();

                // Optionally, you can return the created client
                return response()->json(['client' => 'New Temp Added'], 201);
            }

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getTemp(Request $request) {
        try {
            
            $clients = Temp::where('id', $request->id)->first();

           // return response()->json(['clients' => $clients], 200);
            return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching temp: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function UpdateTemp(Request $request) {
        try {
            
            $clients = Temp::where('id', $request->id)->first();

            if ($clients) {
                // $client = new Client();
                // $client->name = $request->name;
                // $client->email = $request->email;
                // $client->phone = $request->phone;
                // $client->address = $request->address;
                $clients->update(['title' => $request->title, 'email' => $request->email,'phone' => $request->phone, 'firstName' => $request->firstName, 'lastName' => $request->lastName, 'experience' => $request->experience, 'status' => $request->status, 'basePay' => $request->basePay, 'skills' => $request->skills]);

                return response()->json(['client' => 'Temp Updated'], 201);
            }
            else
            {
               return response()->json(['error' => 'Temp Does Not Exist'], 400);

                // Optionally, you can return the created client
                
            }

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

      public function approveTemp(Request $request, $id)
    {
        $timesheet = Temp::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Temp not found'], 404);
        }

        // if ($timesheet->approvalStatus !== 'pending') {
        //     print_r($timesheet->approvalStatus);
        //     return response()->json(['error' => 'Only pending temps can be approved'], 400);
        // }

        $approverId = $request->input('approverId');
        $timesheet->approvalStatus = 'approved';
        $timesheet->save();

        // Notify temp about approval
        $this->notifyATemp($timesheet->tempId, 'Approved');

        return response()->json(['message' => 'Temp approved', 'timesheet' => $timesheet]);
    }

    // Reject timesheet
    public function declineTemp(Request $request, $id)
    {
        $timesheet = Temp::find($id);
        //print_r($timesheet);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }



        // if ($timesheet->approvalStatus !== 'pending') {
        //     return response()->json(['error' => 'Only pending temps can be rejected'], 400);
        // }

        //$rejectionReason = $request->input('rejectionReason');
        $timesheet->approvalStatus = 'declined';
        // $timesheet->rejectionReason = $rejectionReason;
        // $timesheet->approvedBy = null;
        // $timesheet->approvedDate = null;
        $timesheet->save();

        // Notify temp about rejection
        $this->notifyATemp($timesheet->id,'Declined');

        return response()->json(['message' => 'Temp declined', 'timesheet' => $timesheet]);
    }




    public function signup(Request $request) {
        try {
            
            $admins = WorkerlyUser::where('email', $request->email)->first();

            if ($admins) {
                return response()->json(['error' => 'User already exists'], 400);
            }
            else
            {
                $client = new WorkerlyUser();
                $client->firstName = $request->firstName;
                $client->lastName = $request->lastName;
                $client->email = $request->email;
                $client->password = password_hash($request->password, PASSWORD_DEFAULT); // Hash the password;
                $client->role = $request->role;
                $client->save();

                // Optionally, you can return the created client
                return response()->json($request->all());
            }

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function signin(Request $request) {
        try {
            
            $clients = WorkerlyUser::where('email', $request->email)->first();

            if(password_verify($request->password, $clients->password)){
                return response()->json($clients);
            }

            //return response()->json(['clients' => $clients], 200);
            //return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching user: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    /////TimeSheet
    public function submit($id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'draft') {
            return response()->json(['error' => 'Only draft timesheets can be submitted'], 400);
        }

        $timesheet->status = 'submitted';
        $timesheet->submittedDate = now();
        $timesheet->save();

        // Optionally notify admins here

        return response()->json(['message' => 'Timesheet submitted for approval', 'timesheet' => $timesheet]);
    }

    // Approve timesheet
    public function approve(Request $request, $id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'submitted') {
            return response()->json(['error' => 'Only submitted timesheets can be approved'], 400);
        }

        $approverId = $request->input('approverId');
        $timesheet->status = 'approved';
        $timesheet->approvedBy = $approverId;
        $timesheet->approvedDate = now();
        $timesheet->save();

        // Notify temp about approval
        $this->notifyTemp($timesheet->tempId, 'approved');

        return response()->json(['message' => 'Timesheet approved', 'timesheet' => $timesheet]);
    }

    // Reject timesheet
    public function reject(Request $request, $id)
    {
        $timesheet = Timesheet::find($id);
        if (!$timesheet) {
            return response()->json(['error' => 'Timesheet not found'], 404);
        }

        if ($timesheet->status !== 'submitted') {
            return response()->json(['error' => 'Only submitted timesheets can be rejected'], 400);
        }

        $rejectionReason = $request->input('rejectionReason');
        $timesheet->status = 'rejected';
        $timesheet->rejectionReason = $rejectionReason;
        $timesheet->approvedBy = null;
        $timesheet->approvedDate = null;
        $timesheet->save();

        // Notify temp about rejection
        $this->notifyTemp($timesheet->tempId, 'rejected', $rejectionReason);

        return response()->json(['message' => 'Timesheet rejected', 'timesheet' => $timesheet]);
    }

    // Notify temp helper function
    protected function notifyTemp($tempId, $status, $reason = null)
    {
        // Fetch temp user email or contact info
        $temp = \App\Models\Temp::find($tempId);
        if (!$temp) {
            Log::warning("Temp with ID $tempId not found for notification");
            return;
        }

        $email = $temp->email;
        $subject = "Your timesheet has been $status";
        $message = "Your timesheet has been $status.";
        if ($status === 'rejected' && $reason) {
            $message .= " Reason: $reason";
        }

        // Send email notification (example)
        ////Send SMS
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
            CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => http_build_query([
                'sender' => 'Workerly',
                'message' => 'Hello, '.$temp->firstName.' '.$temp->lastName.', '.$message.' Please login to your account to view full details.',
                'recipients' => [$temp->phone],
                // When sending SMS to Nigerian recipients, specify the use_case field
                // 'use_case' => 'transactional'
            ]),
        ]);

        $response = curl_exec($curl);
        curl_close($curl);
        // Mail::raw($message, function ($mail) use ($email, $subject) {
        //     $mail->to($email)
        //         ->subject($subject);
        // });
    }

     protected function notifyATemp($tempId, $status, $reason = null)
    {
        // Fetch temp user email or contact info
        $temp = \App\Models\Temp::find($tempId);
        if (!$temp) {
            Log::warning("Temp with ID $tempId not found for notification");
            return;
        }

        $email = $temp->email;
        $subject = "Your temp account has been $status";
        $message = "Your temp account has been $status.";
        if ($status === 'rejected' && $reason) {
            $message .= " Reason: $reason";
        }

        // Send email notification (example)
        ////Send SMS
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
            CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => http_build_query([
                'sender' => 'Workerly',
                'message' => 'Hello, '.$temp->firstName.' '.$temp->lastName.', '.$message.' Please login to your account to view full details.',
                'recipients' => [$temp->phone],
                // When sending SMS to Nigerian recipients, specify the use_case field
                // 'use_case' => 'transactional'
            ]),
        ]);

        $response = curl_exec($curl);
        curl_close($curl);
        // Mail::raw($message, function ($mail) use ($email, $subject) {
        //     $mail->to($email)
        //         ->subject($subject);
        // });
    }

      public function signTemp(Request $request) {
        try {
            
            $admins = Temp::where('email', $request->email)->first();

            if ($admins) {
                return response()->json(['success'=>false,'error' => 'Temp already exists'], 400);
            }
            else
            {
                $client = new Temp();
                $client->title = $request->title;
                $client->firstName = $request->firstName;
                $client->lastName = $request->lastName;
                $client->email = $request->email;
                $client->phone = $request->phone;
                $client->experience = $request->experience;
                $client->status = 'active'; // Default status
                $client->password = password_hash($request->password, PASSWORD_DEFAULT); // Hash the password
                $client->role = $request->role;
                $client->basePay = $request->basePay;
                $client->skills = $request->skills;
                $client->approvalStatus = 'pending';
                $client->save();

                // $client = new Temp();
                // $client->firstName = $request->firstName;
                // $client->lastName = $request->lastName;
                // $client->email = $request->email;
                // $client->password = password_hash($request->password, PASSWORD_DEFAULT); // Hash the password;
                // $client->role = $request->role;
                // $client->save();
                $record = Temp::where('email', $request->email)->first();

                ////Send SMS
                $curl = curl_init();

                curl_setopt_array($curl, [
                    CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
                    CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_ENCODING => '',
                    CURLOPT_MAXREDIRS => 10,
                    CURLOPT_TIMEOUT => 0,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                    CURLOPT_CUSTOMREQUEST => 'POST',
                    CURLOPT_POSTFIELDS => http_build_query([
                        'sender' => 'Workerly',
                        'message' => 'A new temp registration has been received for '.$request->firstName.' '.$request->lastName.'. Login to update the temp status.',
                        'recipients' => ['0203558151'],
                        // When sending SMS to Nigerian recipients, specify the use_case field
                        // 'use_case' => 'transactional'
                    ]),
                ]);

                $response = curl_exec($curl);
                curl_close($curl);

                // Optionally, you can return the created client
                return response()->json(['success'=>true,'temp'=>$record]);
            }

        } catch (Exception $e) {
            Log::error('Error fetching clients: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function loginTemp(Request $request) {
        try {
            
            $clients = Temp::where('email', $request->email)->first();

           // print_r($clients->password);
            if(password_verify($request->password, $clients->password)){
                return response()->json(['success'=>true,'temp'=>$clients]);
            }

            // return response()->json(['success'=>true,'temp'=>$clients]);
            //return $clients;
        } catch (Exception $e) {
            Log::error('Error fetching user: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateOrder(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'id' => 'required|integer',
            'qr_code' => 'required|string',
            'verified' => 'sometimes|boolean',
            'verifiedAt' => 'sometimes|nullable|date',
            'accesstime' => 'sometimes|nullable|string',
            'flagstatus' => 'sometimes|nullable|integer',
            'flagtime' => 'sometimes|nullable|string',
            'scantime' => 'sometimes|nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find the order by ID
            $order = DB::table('orders')->where('id', $request->id)->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Prepare update data
            $updateData = [];
            
            if ($request->has('verified')) {
                $updateData['verified'] = $request->verified;
            }
            
            if ($request->has('verifiedAt')) {
                $updateData['verified_at'] = $request->verifiedAt;
            }
            
            if ($request->has('accesstime')) {
                $updateData['accesstime'] = $request->accesstime;
            }
            
            if ($request->has('flagstatus')) {
                $updateData['flagstatus'] = $request->flagstatus;
            }
            
            if ($request->has('flagtime')) {
                $updateData['flagtime'] = $request->flagtime;
            }
            
            if ($request->has('scantime')) {
                $updateData['scantime'] = $request->scantime;
            }

            // Update the order
            DB::table('orders')
                ->where('id', $request->id)
                ->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $updateData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
