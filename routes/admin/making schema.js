//for making schema on workimg
            var doc = new dependUsers({
                'fullname': "ABCD",
                'userId': patient_id
            })
            doc.save(function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(data);
                    }
                })
