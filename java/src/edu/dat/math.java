package edu.dat;

public class math implements PublicationListener {

	MQTTWrapper mathApp;
	
	int counter = 0;
	
	public math () {
		
		mathApp = new MQTTWrapper(this);
		
		try {
			
			mathApp.subscribeTo("led/#");
			
		} catch (Exception e) {
			
			System.out.println(e);
			
		}
	}
	
	@Override
	public void messageReceived(String topic, String data) {
		
		try {
			
			if (topic.equals("led/status/arduino")) {
				
				// mathApp.publish("led/status", data);
				
				counter++;
				
				System.out.println("Got some data bro (" + counter + "): " + data);
				
			}
			
//			String[] numbers = data.split(":");
//				
//			double a = Double.parseDouble(numbers[0].trim());
//			
//			double b = Double.parseDouble(numbers[1].trim());
//
//			if (topic.equals("math/add")) {
//				
//				mathApp.publish("math/result", String.valueOf(a + b));
//				
//			} else if (topic.equals("math/sub")) {
//				
//				mathApp.publish("math/result", String.valueOf(a - b));
//				
//			} else if (topic.equals("math/mult")) {
//				
//				mathApp.publish("math/result", String.valueOf(a * b));
//				
//			} else if (topic.equals("math/div")) {
//				
//				mathApp.publish("math/result", String.valueOf(a / b));
//				
//			} else {
//				
//				System.err.println("received unsupported opperation " + topic);
//				
//			}
			
		} catch (Exception e) {
			
			System.out.println(e);
			
		}

	}

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		new math();
		
	}

}